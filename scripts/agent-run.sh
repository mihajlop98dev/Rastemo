#!/usr/bin/env bash
#
# Pokupi GitHub issue-e sa labelom "agent-ready", odradi ih preko headless
# Claude Code-a u izolovanom git worktree-u, pusti build gate, i ako prođe
# otvori draft PR ka dev grani. Ne dira main. Ne force-pushuje.
#
# Pokreće se preko launchd (vidi scripts/com.rastemo.agent.plist).

set -uo pipefail

# Launchd ne nasleđuje shell PATH — dodaj poznate lokacije alata ručno.
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$HOME/.npm-global/bin:$PATH"

REPO="mihajlop98dev/Rastemo"
PROJECT_DIR="/Volumes/Extreme Pro/Projects/Rastemo/rastemo-web"
BASE_BRANCH="dev"
MAX_ISSUES=1

STATE_DIR="$HOME/.rastemo-agent"
WORKTREE_ROOT="$STATE_DIR/worktrees"
LOG_DIR="$STATE_DIR/logs"
LOCK_DIR="$STATE_DIR/agent.lock.d"

mkdir -p "$WORKTREE_ROOT" "$LOG_DIR"

RUN_LOG="$LOG_DIR/run-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$RUN_LOG") 2>&1

echo "=== Pokretanje $(date) ==="

for bin in git gh npm jq claude osascript; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "Nedostaje '$bin' na PATH-u ($PATH). Prekidam."
    exit 1
  fi
done

# Atomičan lock preko mkdir (macOS nema flock po default-u).
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Prethodno pokretanje je još aktivno (lock: $LOCK_DIR). Preskačem."
  exit 0
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null' EXIT

notify() {
  osascript -e "display notification \"$2\" with title \"Rastemo agent\" subtitle \"$1\"" >/dev/null 2>&1 || true
}

cd "$PROJECT_DIR" || { echo "Ne mogu da uđem u $PROJECT_DIR"; exit 1; }

git fetch origin --quiet

if ! git show-ref --verify --quiet "refs/remotes/origin/$BASE_BRANCH"; then
  echo "Grana '$BASE_BRANCH' ne postoji na origin-u. Napravi je ručno pre prvog pokretanja:"
  echo "  git checkout -b $BASE_BRANCH main && git push -u origin $BASE_BRANCH"
  exit 1
fi

RULES_FILE="$PROJECT_DIR/.claude/agent-rules.md"
if [ ! -f "$RULES_FILE" ]; then
  echo "Nema $RULES_FILE. Prekidam."
  exit 1
fi

issues_json=$(gh issue list --repo "$REPO" --label agent-ready --state open \
  --json number,title,body --limit "$MAX_ISSUES") || { echo "gh issue list nije uspeo."; exit 1; }

count=$(echo "$issues_json" | jq 'length')
echo "Pronađeno agent-ready issue-a: $count"

if [ "$count" -eq 0 ]; then
  exit 0
fi

echo "$issues_json" | jq -c '.[]' | while IFS= read -r issue; do
  number=$(echo "$issue" | jq -r '.number')
  title=$(echo "$issue" | jq -r '.title')
  body=$(echo "$issue" | jq -r '.body')

  echo ""
  echo "=== Issue #$number: $title ==="

  current_labels=$(gh issue view "$number" --repo "$REPO" --json labels --jq '[.labels[].name] | join(",")')
  if echo "$current_labels" | grep -qE "agent-in-progress|agent-done"; then
    echo "Preskačem #$number — već je u obradi ili gotov ($current_labels)."
    continue
  fi

  gh issue edit "$number" --repo "$REPO" --remove-label agent-ready --add-label agent-in-progress

  slug=$(echo "$title" \
    | iconv -f utf-8 -t ascii//TRANSLIT 2>/dev/null \
    | tr '[:upper:]' '[:lower:]' \
    | tr -cs 'a-z0-9' '-' \
    | sed 's/^-*//;s/-*$//' \
    | cut -c1-40)
  [ -z "$slug" ] && slug="task"
  branch="agent/issue-${number}-${slug}"
  worktree_dir="$WORKTREE_ROOT/issue-${number}"

  git worktree remove --force "$worktree_dir" 2>/dev/null
  rm -rf "$worktree_dir"
  git worktree prune

  if ! git worktree add -b "$branch" "$worktree_dir" "origin/$BASE_BRANCH"; then
    echo "Ne mogu da napravim worktree/granu za #$number (grana već postoji?)."
    gh issue edit "$number" --repo "$REPO" --remove-label agent-in-progress --add-label agent-failed
    gh issue comment "$number" --repo "$REPO" --body "Agent nije uspeo da napravi radnu granu ($branch) — verovatno već postoji. Proveri ručno."
    notify "Issue #$number" "Neuspeh: ne mogu da napravim granu"
    continue
  fi

  prompt_file=$(mktemp)
  {
    echo "# Zadatak: GitHub issue #$number"
    echo ""
    echo "## Naslov"
    echo "$title"
    echo ""
    echo "## Opis"
    echo "$body"
    echo ""
    cat "$RULES_FILE"
  } > "$prompt_file"

  echo "--- Pokrećem Claude Code (headless) ---"
  claude_exit=0
  (
    cd "$worktree_dir" && claude -p --dangerously-skip-permissions < "$prompt_file"
  )
  claude_exit=$?
  rm -f "$prompt_file"
  echo "Claude Code exit code: $claude_exit"

  summary=""
  if [ -f "$worktree_dir/.agent/summary.md" ]; then
    summary=$(cat "$worktree_dir/.agent/summary.md")
    rm -rf "$worktree_dir/.agent"
  fi

  echo "--- Build gate: npm run build ---"
  gate_log="$LOG_DIR/issue-${number}-gate.log"
  gate_ok=true
  (cd "$worktree_dir" && npm run build) > "$gate_log" 2>&1
  if [ $? -ne 0 ]; then
    gate_ok=false
  fi

  changes=$(cd "$worktree_dir" && git status --porcelain)

  if [ "$claude_exit" -ne 0 ] || [ "$gate_ok" = false ] || [ -z "$changes" ]; then
    echo "Neuspeh za #$number (claude_exit=$claude_exit, gate_ok=$gate_ok, ima_izmena=${changes:+da})"
    tail_log=$(tail -n 60 "$gate_log")
    fail_body="Agent nije uspeo da završi zadatak automatski.

**Sažetak agenta:**
${summary:-"(nema)"}

**Poslednjih 60 linija build log-a:**
\`\`\`
$tail_log
\`\`\`

Pogledaj granu \`$branch\` ako postoji, ili doradi opis issue-a pa vrati \`agent-ready\`."
    gh issue edit "$number" --repo "$REPO" --remove-label agent-in-progress --add-label agent-failed
    gh issue comment "$number" --repo "$REPO" --body "$fail_body"
    git worktree remove --force "$worktree_dir" 2>/dev/null
    git branch -D "$branch" 2>/dev/null
    notify "Issue #$number" "Neuspeh — proveri GitHub"
    continue
  fi

  echo "--- Gate prošao, commit + push ---"
  commit_msg="Issue #$number: $title

${summary:-"Automatski generisano, pregledaj pre merge-a."}

Automatski generisano od strane lokalnog agenta."

  (
    cd "$worktree_dir"
    git add -A
    git commit -m "$commit_msg" --quiet
    git push -u origin "$branch" --quiet
  )
  push_exit=$?

  if [ "$push_exit" -ne 0 ]; then
    echo "Push nije uspeo za #$number."
    gh issue edit "$number" --repo "$REPO" --remove-label agent-in-progress --add-label agent-failed
    gh issue comment "$number" --repo "$REPO" --body "Agent je uradio izmene i prošao build gate, ali push grane $branch nije uspeo. Proveri ručno."
    notify "Issue #$number" "Neuspeh pri push-u"
    continue
  fi

  pr_body="Automatski PR za #$number, generisan od lokalnog agenta.

**Sažetak:**
${summary:-"(agent nije ostavio sažetak)"}

Build gate (\`npm run build\`): prošao.

Zatvara #$number nakon review-a i merge-a — **ne mergeuj bez ručnog pregleda.**"

  pr_url=$(gh pr create --repo "$REPO" --base "$BASE_BRANCH" --head "$branch" \
    --title "Issue #$number: $title" \
    --draft \
    --body "$pr_body")

  gh issue edit "$number" --repo "$REPO" --remove-label agent-in-progress --add-label agent-done
  gh issue comment "$number" --repo "$REPO" --body "Otvoren draft PR: $pr_url"

  git worktree remove --force "$worktree_dir" 2>/dev/null

  echo "Gotovo #$number -> $pr_url"
  notify "Issue #$number spreman" "$pr_url"
done

echo "=== Kraj $(date) ==="
