/**
 * Japanski eto (干支) — znak deteta po godini rođenja.
 *
 * Japanski sistem nije zaseban od kineskog: Japan ga je preuzeo iz Kine.
 * Iste su dvanaest zemaljskih grana, istih deset nebeskih stabljika, isti
 * šezdesetogodišnji ciklus, isti pet elemenata i isti jin/jang. Razlikuju se
 * imena — Nezumi umesto Pacov — i to što Japan na dvanaestom mestu ima vepra
 * tamo gde Kina ima svinju. Stranica to i kaže; predstaviti ga kao poseban
 * sistem bilo bi netačno.
 *
 * Granica godine je lunarna Nova godina, ista tablica koju koristi i kineski
 * horoskop. Bez toga bi svako dete rođeno u januaru dobilo pogrešan znak.
 */
import { KINESKA_NOVA_GODINA } from './zabava';

export type ElementNaziv = 'Drvo' | 'Vatra' | 'Zemlja' | 'Metal' | 'Voda';
export type JinJang = 'Jin' | 'Jang';

export interface JunishiZnak {
  /** Mesto u krugu, 1–12. */
  mesto: number;
  srpski: string;
  japanski: string;
  kanji: string;
  grana: string;
  emoji: string;
  /** Kakvo je to dete — dve rečenice, ne proricanje nego opis ćudi. */
  priroda: string;
  snage: string[];
  izazovi: string[];
  /** Šta takvom detetu najviše pomaže od roditelja. */
  roditeljima: string;
}

/** Dvanaest znakova, redom kojim stoje u krugu. */
export const JUNISHI: JunishiZnak[] = [
  {
    mesto: 1, srpski: 'Pacov', japanski: 'Nezumi', kanji: '鼠', grana: '子', emoji: '🐀',
    priroda: 'Dete koje sve primeti pre nego što se od njega očekuje. Rano počne da povezuje stvari i voli da zna kako nešto radi, pa ume da rastavi ono što ne bi trebalo.',
    snage: ['brzo uči', 'snalažljivo', 'radoznalo', 'druželjubivo', 'pamti detalje', 'lako se prilagodi promeni'],
    izazovi: ['nestrpljivo', 'ume da bude previše oprezno sa nepoznatima', 'teško se smiruje uveče', 'brzo mu dosadi', 'sve hoće odmah'],
    roditeljima: 'Daj mu da istražuje u granicama koje su jasne. Zabrana bez objašnjenja kod ovog deteta radi obrnuto — potražiće način da ipak proveri.',
  },
  {
    mesto: 2, srpski: 'Vo', japanski: 'Ushi', kanji: '牛', grana: '丑', emoji: '🐂',
    priroda: 'Mirno dete koje ide svojim tempom i ne voli da ga se požuruje. Ono što nauči, nauči temeljno, ali mu treba više vremena nego drugima na početku.',
    snage: ['strpljivo', 'pouzdano', 'istrajno', 'smireno', 'ne odustaje lako', 'ima svoj red'],
    izazovi: ['tvrdoglavo', 'teško menja naviku', 'ne voli iznenadne promene', 'ume da ćuti kad mu je teško', 'sporo se otvara'],
    roditeljima: 'Ne požuruj ga. Ovom detetu najviše pomaže predvidiv dan i to da zna šta sledi — tada iznenadi koliko može.',
  },
  {
    mesto: 3, srpski: 'Tigar', japanski: 'Tora', kanji: '虎', grana: '寅', emoji: '🐅',
    priroda: 'Dete puno energije koje prvo krene pa onda pomisli. Hrabro je i pravdoljubivo, staje u odbranu drugih i pre nego što razume ceo povod.',
    snage: ['hrabro', 'iskreno', 'zaštitnički nastrojeno', 'puno energije', 'vodi druge', 'brzo se oporavi od neuspeha'],
    izazovi: ['naglo', 'teško podnosi pravila koja ne razume', 'ume da preteruje', 'brzo plane', 'ne voli da čeka red'],
    roditeljima: 'Umesto zabrana, daj mu gde da potroši energiju. Objašnjeno pravilo ovo dete poštuje; naređeno ga izaziva.',
  },
  {
    mesto: 4, srpski: 'Zec', japanski: 'U', kanji: '兎', grana: '卯', emoji: '🐇',
    priroda: 'Nežno dete koje oseti raspoloženje u sobi pre nego što iko progovori. Izbegava sukob i traži mir, ponekad i po cenu toga da ne kaže šta hoće.',
    snage: ['blago', 'pažljivo prema drugima', 'lepo se igra sa vršnjacima', 'uočava tuđa osećanja', 'strpljivo', 'smiruje druge'],
    izazovi: ['osetljivo na povišen ton', 'teško kaže „ne"', 'povuče se kad je napetost', 'brine više nego što pokazuje', 'izbegava takmičenje'],
    roditeljima: 'Pitaj ga direktno šta želi — samo od sebe neće reći. I pazi na ton: kod ovog deteta glasno ne znači jasnije, nego strašnije.',
  },
  {
    mesto: 5, srpski: 'Zmaj', japanski: 'Tatsu', kanji: '龍', grana: '辰', emoji: '🐉',
    priroda: 'Dete koje se primeti čim uđe. Ima velike zamisli i veruje u njih, pa ume da povuče ostalu decu za sobom — i u dobro i u nestašluk.',
    snage: ['samouvereno', 'maštovito', 'puno poleta', 'ne plaši se da bude primećeno', 'velikodušno', 'brzo se dogovara sa drugima'],
    izazovi: ['teško podnosi da ne uspe iz prve', 'ume da preceni sebe', 'ne voli da bude ispravljano', 'nestrpljivo sa sporijima', 'traži pažnju'],
    roditeljima: 'Hvali trud, ne samo rezultat. Zmaj koji nauči da se posle pada ustane bez sramote nosi tu snagu ceo život.',
  },
  {
    mesto: 6, srpski: 'Zmija', japanski: 'Mi', kanji: '蛇', grana: '巳', emoji: '🐍',
    priroda: 'Tiho dete koje dugo posmatra pre nego što se uključi. Ne priča mnogo o sebi, ali razume više nego što pokazuje.',
    snage: ['promišljeno', 'pažljivo', 'samostalno', 'dobro procenjuje ljude', 'usredsređeno', 'ne poteže reč napamet'],
    izazovi: ['zatvoreno', 'teško traži pomoć', 'dugo nosi ono što ga muči', 'sumnjičavo prema nepoznatima', 'sporo se otvara u grupi'],
    roditeljima: 'Ne teraj ga da priča kad neće. Ovom detetu treba prilika, ne pritisak — a prilika je obično zajednička tiha radnja, ne pitanje u lice.',
  },
  {
    mesto: 7, srpski: 'Konj', japanski: 'Uma', kanji: '馬', grana: '午', emoji: '🐎',
    priroda: 'Dete koje ne stoji u mestu. Voli društvo, kretanje i promenu, i teško podnosi dugo sedenje bez razloga.',
    snage: ['veselo', 'otvoreno', 'brzo sklapa prijateljstva', 'puno energije', 'lako se oduševi', 'iskreno govori šta misli'],
    izazovi: ['teško se usredsredi', 'brzo mu dosadi', 'kaže pre nego što promisli', 'ne voli ograničenja', 'preskače korake'],
    roditeljima: 'Kratki zadaci sa jasnim krajem rade bolje od dugih. Kretanje pre učenja ovom detetu nije razonoda nego priprema.',
  },
  {
    mesto: 8, srpski: 'Ovca', japanski: 'Hitsuji', kanji: '羊', grana: '未', emoji: '🐑',
    priroda: 'Meko i maštovito dete, sklono crtanju, pričama i igri koju samo izmisli. Traži bliskost i lakše se oseća u malom društvu nego u gomili.',
    snage: ['maštovito', 'nežno', 'saosećajno', 'lepo se izražava', 'strpljivo u onome što voli', 'primeti kad je nekome teško'],
    izazovi: ['nesigurno u novoj sredini', 'traži potvrdu', 'teško se odvaja', 'uzima kritiku lično', 'okleva pri odluci'],
    roditeljima: 'Sigurnost mu daje hrabrost, ne obrnuto. Kad zna da ima gde da se vrati, iznenađujuće lako krene napred.',
  },
  {
    mesto: 9, srpski: 'Majmun', japanski: 'Saru', kanji: '猿', grana: '申', emoji: '🐒',
    priroda: 'Dosetljivo dete koje brzo shvati i još brže smisli kako da zaobiđe. Zabavno je i zarazno veselo, ali ume da isproba svaku granicu.',
    snage: ['bistro', 'duhovito', 'snalažljivo', 'brzo uči', 'lako se uklopi', 'ne obeshrabri se lako'],
    izazovi: ['isprobava granice', 'nestalno u interesovanjima', 'ume da se izvlači', 'nestrpljivo', 'teško istrpi dosadu'],
    roditeljima: 'Granice moraju biti iste svaki dan. Kod ovog deteta popuštanje jednom znači da će sutra probati dvaput.',
  },
  {
    mesto: 10, srpski: 'Petao', japanski: 'Tori', kanji: '鳥', grana: '酉', emoji: '🐓',
    priroda: 'Dete koje voli red i tačnost i primeti kad nešto nije na svom mestu. Kaže šta misli, ponekad direktnije nego što se očekuje.',
    snage: ['uredno', 'iskreno', 'odgovorno', 'primeti detalj', 'organizovano', 'drži se dogovora'],
    izazovi: ['kritično prema sebi', 'teško podnosi nered', 'ume da bude oštro na reči', 'perfekcionizam', 'ne voli da greši pred drugima'],
    roditeljima: 'Nauči ga da greška nije neuspeh. Ovo dete samo sebe najstrože ocenjuje i tu mu treba pomoć, ne još merila.',
  },
  {
    mesto: 11, srpski: 'Pas', japanski: 'Inu', kanji: '犬', grana: '戌', emoji: '🐕',
    priroda: 'Odano dete sa jakim osećajem za pravdu. Vezuje se duboko i teško podnosi kad se neko prema nekome ponaša ružno.',
    snage: ['odano', 'pošteno', 'zaštitnički nastrojeno', 'pouzdano', 'saosećajno', 'stoji uz svoje'],
    izazovi: ['brine', 'teško veruje odmah', 'uzima tuđe brige na sebe', 'tvrdoglavo kad misli da je u pravu', 'osetljivo na nepravdu'],
    roditeljima: 'Objasni mu zašto, ne samo šta. Ovom detetu je razlog važniji od pravila i mirnije je kad razume.',
  },
  {
    mesto: 12, srpski: 'Vepar', japanski: 'I', kanji: '亥', grana: '亥', emoji: '🐗',
    priroda: 'Srdačno i otvoreno dete koje daje bez računa. Uporno je u onome što zavoli i teško odustaje kad se jednom uhvati.',
    snage: ['dobrodušno', 'iskreno', 'izdržljivo', 'velikodušno', 'ne pamti zlo', 'ide do kraja'],
    izazovi: ['lakoverno', 'teško kaže dosta', 'tvrdoglavo', 'ume da preteruje u onome što voli', 'sporo primeti da ga neko koristi'],
    roditeljima: 'Nauči ga da odbije bez griže savesti. Široko srce je njegova najveća snaga i najlakše mesto za povredu.',
  },
];

/** Deset nebeskih stabljika, redom. Element i jin/jang idu uz stabljiku. */
export const STABLJIKE: { kanji: string; japanski: string; element: ElementNaziv; jinJang: JinJang }[] = [
  { kanji: '甲', japanski: 'Kinoe', element: 'Drvo',   jinJang: 'Jang' },
  { kanji: '乙', japanski: 'Kinoto', element: 'Drvo',  jinJang: 'Jin'  },
  { kanji: '丙', japanski: 'Hinoe', element: 'Vatra',  jinJang: 'Jang' },
  { kanji: '丁', japanski: 'Hinoto', element: 'Vatra', jinJang: 'Jin'  },
  { kanji: '戊', japanski: 'Tsuchinoe', element: 'Zemlja', jinJang: 'Jang' },
  { kanji: '己', japanski: 'Tsuchinoto', element: 'Zemlja', jinJang: 'Jin' },
  { kanji: '庚', japanski: 'Kanoe', element: 'Metal',  jinJang: 'Jang' },
  { kanji: '辛', japanski: 'Kanoto', element: 'Metal', jinJang: 'Jin'  },
  { kanji: '壬', japanski: 'Mizunoe', element: 'Voda', jinJang: 'Jang' },
  { kanji: '癸', japanski: 'Mizunoto', element: 'Voda', jinJang: 'Jin' },
];

/** Kratko o tome šta element nosi kao ćud. */
export const ELEMENTI: Record<ElementNaziv, { kanji: string; opis: string }> = {
  Drvo:   { kanji: '木', opis: 'rast i širenje — dete koje gura napred i lako prihvata novo' },
  Vatra:  { kanji: '火', opis: 'toplina i polet — dete koje se brzo zapali i povuče druge' },
  Zemlja: { kanji: '土', opis: 'oslonac i strpljenje — dete koje smiruje i drži se svog' },
  Metal:  { kanji: '金', opis: 'jasnoća i red — dete koje voli da zna granice i pravila' },
  Voda:   { kanji: '水', opis: 'tišina i prilagodljivost — dete koje posmatra pa se snađe' },
};

/** Tri harmonične grupe (sanhe) — znakovi koji se prirodno slažu. */
export const SANHE: string[][] = [
  ['Pacov', 'Zmaj', 'Majmun'],
  ['Vo', 'Zmija', 'Petao'],
  ['Tigar', 'Konj', 'Pas'],
  ['Zec', 'Ovca', 'Vepar'],
];

/** Parovi tajne sloge (liuhe). */
export const LIUHE: Record<string, string> = {
  Pacov: 'Vo', Vo: 'Pacov',
  Tigar: 'Vepar', Vepar: 'Tigar',
  Zec: 'Pas', Pas: 'Zec',
  Zmaj: 'Petao', Petao: 'Zmaj',
  Zmija: 'Majmun', Majmun: 'Zmija',
  Konj: 'Ovca', Ovca: 'Konj',
};

/** Parovi sudara (chong) — suprotni znakovi u krugu. */
export const CHONG: Record<string, string> = {
  Pacov: 'Konj', Konj: 'Pacov',
  Vo: 'Ovca', Ovca: 'Vo',
  Tigar: 'Majmun', Majmun: 'Tigar',
  Zec: 'Petao', Petao: 'Zec',
  Zmaj: 'Pas', Pas: 'Zmaj',
  Zmija: 'Vepar', Vepar: 'Zmija',
};

export function getSanhe(zivotinja: string): string[] {
  const grupa = SANHE.find((g) => g.includes(zivotinja));
  return grupa ? grupa.filter((z) => z !== zivotinja) : [];
}
export const getLiuhe = (zivotinja: string): string | null => LIUHE[zivotinja] ?? null;
export const getChong = (zivotinja: string): string | null => CHONG[zivotinja] ?? null;

export interface Eto {
  godina: number;
  znak: JunishiZnak;
  stabljika: (typeof STABLJIKE)[number];
  element: ElementNaziv;
  jinJang: JinJang;
  /** Naziv kombinacije, npr. „丙午 — Hinoe-Uma". */
  naziv: string;
  /** Mesto u šezdesetogodišnjem ciklusu, 1–60. */
  mesto: number;
}

/**
 * Eto za datu lunarnu godinu.
 *
 * Polazna tačka je 1984 = 甲子, prvo mesto u ciklusu. Provereno na 1984, 2020
 * (庚子), 2024 (甲辰) i 1966/2026 (丙午).
 */
export function etoZaGodinu(godina: number): Eto {
  const mesto = (((godina - 4) % 60) + 60) % 60 + 1;
  const stabljika = STABLJIKE[(mesto - 1) % 10];
  const znak = JUNISHI[(mesto - 1) % 12];
  return {
    godina,
    znak,
    stabljika,
    element: stabljika.element,
    jinJang: stabljika.jinJang,
    naziv: `${stabljika.kanji}${znak.grana} — ${stabljika.japanski}-${znak.japanski}`,
    mesto,
  };
}

/** Znak deteta po datumu rođenja ili terminu; null van tablice. */
export function etoZaDatum(d: Date): Eto | null {
  const g = d.getFullYear();
  const nova = KINESKA_NOVA_GODINA[g];
  if (!nova) return null;
  const lunarna = d < new Date(nova + 'T00:00:00') ? g - 1 : g;
  return etoZaGodinu(lunarna);
}

/**
 * Hinoe-Uma (丙午), 43. mesto u ciklusu, vraća se svakih šezdeset godina.
 *
 * U Japanu se uz nju vezuje verovanje da devojčice rođene te godine donose
 * nesreću mužu. Godine 1966. je zbog toga broj rođenih pao za oko četvrtinu —
 * to je jedini poznat slučaj da je praznoverica ostavila vidljiv trag u
 * demografiji jedne zemlje. Sledeća je 2026, koja je počela 17. februara.
 */
export const HINOEUMA_MESTO = 43;
export const jeHinoeuma = (e: Eto): boolean => e.mesto === HINOEUMA_MESTO;
