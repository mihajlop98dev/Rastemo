export const babySizeComparisons: Record<number, string> = {
  8: 'malina', 12: 'kajsija', 16: 'avokado', 20: 'banana',
  21: 'nara', 24: 'kukuruza', 28: 'patlidžana', 32: 'kokosa',
  36: 'zelene salate', 40: 'lubenice',
};

export function babyComparisonForWeek(week: number): string {
  const keys = Object.keys(babySizeComparisons).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) if (week >= k) closest = k;
  return babySizeComparisons[closest];
}

export function babyLengthForWeek(week: number): number {
  return Math.round((7 + (week - 8) * 1.55) * 10) / 10;
}

export function babyWeightForWeek(week: number): number {
  const t = (week - 8) / (40 - 8);
  return Math.round(5 + t * t * 3350);
}

export type Trimester = 1 | 2 | 3;

export function trimesterForWeek(week: number): Trimester {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

export interface WeekHighlight {
  icon: 'baby' | 'heart' | 'info';
  title: string;
  text: string;
}

const HOME_HIGHLIGHTS: Record<Trimester, WeekHighlight[]> = {
  1: [
    { icon: 'baby', title: 'Beba', text: 'Formiraju se osnovni organi i nervni sistem. Beba je još veoma mala, ali se brzo razvija svakog dana.' },
    { icon: 'heart', title: 'Ti', text: 'Mogući su mučnina, umor i osetljivost na mirise. Ovo je potpuno uobičajeno u prvom trimestru.' },
    { icon: 'info', title: 'Važno', text: 'Uzimaj folnu kiselinu, odmaraj se i zakaži prvi pregled kod ginekologa ako to još nisi uradila.' },
  ],
  2: [
    { icon: 'baby', title: 'Beba', text: 'Beba intenzivno razvija čula. Možeš početi da primećuješ njene prve pokrete.' },
    { icon: 'heart', title: 'Ti', text: 'Mogući su umor, bol u leđima i pojačana potreba za odmorom.' },
    { icon: 'info', title: 'Važno', text: 'Pij dovoljno vode, odmaraj se i posveti pažnju svojoj ishrani i dobrobiti.' },
  ],
  3: [
    { icon: 'baby', title: 'Beba', text: 'Beba dobija na težini i priprema se za porođaj. Pokreti postaju sve izraženiji.' },
    { icon: 'heart', title: 'Ti', text: 'Otežano disanje, česta potreba za mokrenjem i nesanica su uobičajeni u ovom periodu.' },
    { icon: 'info', title: 'Važno', text: 'Vreme je da spakuješ torbu za porodilište i napraviš plan porođaja ako to još nisi uradila.' },
  ],
};

export function homeHighlightsForWeek(week: number): WeekHighlight[] {
  return HOME_HIGHLIGHTS[trimesterForWeek(week)];
}

export interface DevPoint {
  icon: 'brain' | 'bone' | 'ear' | 'move';
  text: string;
}

const DEV_POINTS: Record<Trimester, DevPoint[]> = {
  1: [
    { icon: 'brain', text: 'Nervni sistem i osnovni obrisi mozga počinju da se formiraju.' },
    { icon: 'bone', text: 'Postavljaju se prvi zameci kostiju i hrskavice.' },
    { icon: 'ear', text: 'Počinju da se formiraju strukture unutrašnjeg uha.' },
    { icon: 'move', text: 'Prvi, jedva primetni pokreti — još se ne osećaju.' },
  ],
  2: [
    { icon: 'brain', text: 'Razvoj mozga i nervnog sistema napreduje ubrzano.' },
    { icon: 'bone', text: 'Kosti i mišići postaju sve jači i izraženiji.' },
    { icon: 'ear', text: 'Beba počinje da razaznaje zvukove iz okruženja.' },
    { icon: 'move', text: 'Sve više prostora za pokrete, protezanje i štucanje.' },
  ],
  3: [
    { icon: 'brain', text: 'Mozak brzo sazreva i priprema se za život van materice.' },
    { icon: 'bone', text: 'Kosti postaju čvršće, a telo se zaokružuje.' },
    { icon: 'ear', text: 'Sluh je potpuno razvijen — beba prepoznaje glasove roditelja.' },
    { icon: 'move', text: 'Pokreti su snažni, ali ima sve manje prostora za njih.' },
  ],
};

export function devPointsForWeek(week: number): DevPoint[] {
  return DEV_POINTS[trimesterForWeek(week)];
}
