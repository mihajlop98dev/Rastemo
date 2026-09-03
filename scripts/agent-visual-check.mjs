#!/usr/bin/env node
//
// Headless vizuelna provera za tester-agent. Loguje se kao test nalog
// (prava produkciona baza — zato SAMO privatne stranice, nikad javne
// akcije poput objavljivanja na forumu) preko prave login forme, obilazi
// zadate rute na zadatim veličinama ekrana, i pravi screenshot-ove.
//
// Kredencijali dolaze iz .env.agent-test.local (gitignore-ovan, nikad u
// repo-u). Format:
//   AGENT_TEST_EMAIL=agent-test@rastemo.test
//   AGENT_TEST_PASSWORD=...
//
// Upotreba:
//   node scripts/agent-visual-check.mjs --routes /home,/preparation --viewports 375x812,1440x900
//   node scripts/agent-visual-check.mjs --routes /zabava --public   (bez logina, za javne stranice)

import { chromium } from 'playwright';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    routes: ['/home'],
    viewports: ['375x812'],
    out: '.agent/screenshots',
    baseUrl: 'http://localhost:4200',
    public: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--routes') opts.routes = args[++i].split(',');
    else if (a === '--viewports') opts.viewports = args[++i].split(',');
    else if (a === '--out') opts.out = args[++i];
    else if (a === '--base-url') opts.baseUrl = args[++i];
    else if (a === '--public') opts.public = true;
  }
  return opts;
}

function loadCredentials() {
  const envPath = path.resolve('.env.agent-test.local');
  if (!existsSync(envPath)) {
    console.error(
      `Nedostaje ${envPath}. Napravi ga sa:\n  AGENT_TEST_EMAIL=...\n  AGENT_TEST_PASSWORD=...`,
    );
    process.exit(1);
  }
  const content = readFileSync(envPath, 'utf-8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

async function main() {
  const opts = parseArgs();
  mkdirSync(opts.out, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  if (!opts.public) {
    const { AGENT_TEST_EMAIL, AGENT_TEST_PASSWORD } = loadCredentials();
    if (!AGENT_TEST_EMAIL || !AGENT_TEST_PASSWORD) {
      console.error('AGENT_TEST_EMAIL / AGENT_TEST_PASSWORD nisu popunjeni u .env.agent-test.local');
      process.exit(1);
    }
    await page.goto(`${opts.baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', AGENT_TEST_EMAIL);
    await page.fill('input[name="password"]', AGENT_TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/login')) {
      console.error('Login nije uspeo — proveri kredencijale u .env.agent-test.local ili da nalog postoji.');
      await browser.close();
      process.exit(1);
    }
  }

  const shots = [];
  for (const route of opts.routes) {
    for (const vp of opts.viewports) {
      const [w, h] = vp.split('x').map(Number);
      await page.setViewportSize({ width: w, height: h });
      await page.goto(`${opts.baseUrl}${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const safeName = `${(route.replace(/\//g, '_') || 'root')}_${vp}.png`;
      const filePath = path.join(opts.out, safeName);
      await page.screenshot({ path: filePath });
      shots.push(filePath);
      console.log(`Screenshot: ${filePath}`);
    }
  }

  await browser.close();
  console.log(`Gotovo. ${shots.length} screenshot(ova) u ${opts.out}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
