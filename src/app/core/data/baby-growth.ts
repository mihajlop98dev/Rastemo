/**
 * Prosečna dužina i težina ploda po nedeljama trudnoće.
 *
 * Vrednosti su prepisane iz standardne referentne tabele fetalnog rasta koju
 * koriste i druge aplikacije za trudnoću (Baby Your Baby / WHO pregled), a ne
 * računate formulom — ranija formula je bila kvadratna aproksimacija koja je
 * sredinu trudnoće precenjivala za nekoliko stotina grama, a pre 8. nedelje
 * davala besmislene vrednosti (negativnu dužinu i težinu veću nego u 8. nedelji).
 *
 * VAŽNO o dužini: do 20. nedelje beba je skupljena pa se meri temeno-trtična
 * dužina (od temena do zadnjice). Od 21. nedelje noge se ispruže i meri se od
 * glave do pete — zato dužina između 20. i 21. nedelje naglo skače. To nije
 * greška; UI zato uz broj prikazuje i šta se meri.
 *
 * Sve su proseci; odstupanja od nekoliko stotina grama su normalna.
 */

/** Poslednja nedelja koja se meri temeno-trtično. */
export const CROWN_RUMP_UNTIL_WEEK = 20;

interface GrowthRow {
  /** cm */
  length: number;
  /** g — ispod 8. nedelje težina je manja od grama, pa stoji 0 */
  weight: number;
  /** poređenje veličine za tu nedelju */
  size: string;
}

const GROWTH: Record<number, GrowthRow> = {
  4:  { length: 0.1,  weight: 0,    size: 'makovog zrna' },
  5:  { length: 0.2,  weight: 0,    size: 'susamovog semena' },
  6:  { length: 0.4,  weight: 0,    size: 'zrna sočiva' },
  7:  { length: 1.0,  weight: 0,    size: 'borovnice' },
  8:  { length: 1.6,  weight: 1,    size: 'maline' },
  9:  { length: 2.3,  weight: 2,    size: 'zrna grožđa' },
  10: { length: 3.1,  weight: 4,    size: 'smokve' },
  11: { length: 4.1,  weight: 7,    size: 'limete' },
  12: { length: 5.4,  weight: 14,   size: 'šljive' },
  13: { length: 7.4,  weight: 23,   size: 'limuna' },
  14: { length: 8.7,  weight: 43,   size: 'breskve' },
  15: { length: 10.1, weight: 70,   size: 'jabuke' },
  16: { length: 11.6, weight: 100,  size: 'avokada' },
  17: { length: 13.0, weight: 140,  size: 'kruške' },
  18: { length: 14.2, weight: 190,  size: 'paprike' },
  19: { length: 15.3, weight: 240,  size: 'paradajza' },
  20: { length: 16.4, weight: 300,  size: 'banane' },
  21: { length: 26.7, weight: 360,  size: 'šargarepe' },
  22: { length: 27.8, weight: 430,  size: 'papaje' },
  23: { length: 28.9, weight: 501,  size: 'grejpfruta' },
  24: { length: 30.0, weight: 600,  size: 'klipa kukuruza' },
  25: { length: 34.6, weight: 660,  size: 'karfiola' },
  26: { length: 35.6, weight: 760,  size: 'zelene salate' },
  27: { length: 36.6, weight: 875,  size: 'glavice kupusa' },
  28: { length: 37.6, weight: 1005, size: 'patlidžana' },
  29: { length: 38.6, weight: 1153, size: 'muskatne tikve' },
  30: { length: 39.9, weight: 1319, size: 'velikog kupusa' },
  31: { length: 41.1, weight: 1502, size: 'kokosa' },
  32: { length: 42.4, weight: 1702, size: 'male dinje' },
  33: { length: 43.7, weight: 1918, size: 'ananasa' },
  34: { length: 45.0, weight: 2146, size: 'dinje' },
  35: { length: 46.2, weight: 2383, size: 'medene dinje' },
  36: { length: 47.4, weight: 2622, size: 'glavice zelene salate' },
  37: { length: 48.6, weight: 2859, size: 'blitve' },
  38: { length: 49.8, weight: 3083, size: 'praziluka' },
  39: { length: 50.7, weight: 3288, size: 'male lubenice' },
  40: { length: 51.2, weight: 3462, size: 'lubenice' },
  41: { length: 51.7, weight: 3597, size: 'bundeve' },
  42: { length: 51.5, weight: 3685, size: 'bundeve' },
};

const FIRST_WEEK = 4;
const LAST_WEEK = 42;

function rowFor(week: number): GrowthRow {
  const w = Math.min(LAST_WEEK, Math.max(FIRST_WEEK, Math.round(week)));
  return GROWTH[w];
}

export function babyComparisonForWeek(week: number): string {
  return rowFor(week).size;
}

export function babyLengthForWeek(week: number): number {
  return rowFor(week).length;
}

export function babyWeightForWeek(week: number): number {
  return rowFor(week).weight;
}

/** Šta tačno znači prikazana dužina za datu nedelju. */
export function babyLengthLabelForWeek(week: number): string {
  return week <= CROWN_RUMP_UNTIL_WEEK ? 'dužina (teme–trtica)' : 'dužina (glava–peta)';
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
