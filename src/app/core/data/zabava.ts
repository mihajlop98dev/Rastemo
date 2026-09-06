/**
 * Podaci za zabavni deo sajta — horoskopi i kineska tablica pola.
 *
 * Ništa ovde nije medicinski podatak niti predviđanje. To je narodna tradicija
 * i tako je i označeno na svakoj stranici koja ove podatke koristi.
 */

export interface KineskiZnak {
  naziv: string;
  emoji: string;
  osobine: string;
  opis: string;
}

/** Redosled je obavezan — po njemu se računa znak iz godine. */
export const KINESKI_ZNACI: KineskiZnak[] = [
  { naziv: 'Pacov', emoji: '🐀', osobine: 'snalažljiv, radoznao, brz',
    opis: 'U predanju je pacov prvi stigao na carev poziv, tako što se povezao na leđa vola i skočio pred cilj. Zato se znak vezuje za dosetljivost.' },
  { naziv: 'Vo', emoji: '🐂', osobine: 'strpljiv, pouzdan, uporan',
    opis: 'Vo je stigao drugi jer je celim putem vukao ostale. Znak se vezuje za tiho istrajavanje i rad bez prečica.' },
  { naziv: 'Tigar', emoji: '🐅', osobine: 'hrabar, nagao, zaštitnički',
    opis: 'U Kini se tigar smatra zaštitnikom dece — njegov lik se veze na dečje papuče i kapice da otera zlo.' },
  { naziv: 'Zec', emoji: '🐇', osobine: 'blag, oprezan, druželjubiv',
    opis: 'Zec se u predanju vezuje za mesec i za mir. Znak se smatra jednim od najspokojnijih u krugu.' },
  { naziv: 'Zmaj', emoji: '🐉', osobine: 'snažan, samouveren, poletan',
    opis: 'Jedini izmišljeni stvor u krugu i najcenjeniji znak. U godinama zmaja u Kini se rodi osetno više dece nego inače.' },
  { naziv: 'Zmija', emoji: '🐍', osobine: 'promišljena, tiha, mudra',
    opis: 'Za razliku od zapadnog shvatanja, zmija u Kini nosi dobar glas — vezuje se za mudrost i suzdržanost.' },
  { naziv: 'Konj', emoji: '🐎', osobine: 'energičan, slobodan, nestrpljiv',
    opis: 'Znak se vezuje za kretanje i nezavisnost. Dete rođeno 2026. godine biće u znaku konja.' },
  { naziv: 'Koza', emoji: '🐐', osobine: 'nežna, maštovita, mirna',
    opis: 'Naziva se i ovcom, jer ista kineska reč pokriva oba. Znak se vezuje za umetnost i blagost.' },
  { naziv: 'Majmun', emoji: '🐒', osobine: 'domišljat, veseo, nemiran',
    opis: 'Vezuje se za igru i brzo učenje. U kineskim pričama majmun je onaj koji prekrši pravilo i prođe nekažnjeno.' },
  { naziv: 'Petao', emoji: '🐓', osobine: 'tačan, direktan, vredan',
    opis: 'Petao budi selo, pa se znak vezuje za red i tačnost. Smatra se i da tera zle duhove.' },
  { naziv: 'Pas', emoji: '🐕', osobine: 'veran, pošten, zaštitnički',
    opis: 'Znak se vezuje za odanost i osećaj za pravdu — u predanju pas prvi primeti nepravdu.' },
  { naziv: 'Svinja', emoji: '🐖', osobine: 'dobrodušna, iskrena, izdašna',
    opis: 'Poslednji znak u krugu. U Kini se vezuje za obilje i blagostanje, a ne za ono što reč znači kod nas.' },
];

/**
 * Kineska godina ne počinje 1. januara, nego između 21. januara i 20. februara.
 * Bez ovoga bi svako dete rođeno u januaru dobilo pogrešan znak.
 */
export const KINESKA_NOVA_GODINA: Record<number, string> = {
  1975: '1975-02-11', 1976: '1976-01-31', 1977: '1977-02-18', 1978: '1978-02-07',
  1979: '1979-01-28', 1980: '1980-02-16', 1981: '1981-02-05', 1982: '1982-01-25',
  1983: '1983-02-13', 1984: '1984-02-02', 1985: '1985-02-20', 1986: '1986-02-09',
  1987: '1987-01-29', 1988: '1988-02-17', 1989: '1989-02-06', 1990: '1990-01-27',
  1991: '1991-02-15', 1992: '1992-02-04', 1993: '1993-01-23', 1994: '1994-02-10',
  1995: '1995-01-31', 1996: '1996-02-19', 1997: '1997-02-07', 1998: '1998-01-28',
  1999: '1999-02-16', 2000: '2000-02-05', 2001: '2001-01-24', 2002: '2002-02-12',
  2003: '2003-02-01', 2004: '2004-01-22', 2005: '2005-02-09', 2006: '2006-01-29',
  2007: '2007-02-18', 2008: '2008-02-07', 2009: '2009-01-26', 2010: '2010-02-14',
  2011: '2011-02-03', 2012: '2012-01-23', 2013: '2013-02-10', 2014: '2014-01-31',
  2015: '2015-02-19', 2016: '2016-02-08', 2017: '2017-01-28', 2018: '2018-02-16',
  2019: '2019-02-05', 2020: '2020-01-25', 2021: '2021-02-12', 2022: '2022-02-01',
  2023: '2023-01-22', 2024: '2024-02-10', 2025: '2025-01-29', 2026: '2026-02-17',
  2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13', 2030: '2030-02-03',
  2031: '2031-01-23', 2032: '2032-02-11', 2033: '2033-01-31', 2034: '2034-02-19',
  2035: '2035-02-08', 2036: '2036-01-28', 2037: '2037-02-15', 2038: '2038-02-04',
  2039: '2039-01-24', 2040: '2040-02-12', 2041: '2041-02-01', 2042: '2042-01-22',
  2043: '2043-02-10',
};

/** Vraća znak za dati datum rođenja, ili null ako je van tabele Nove godine. */
export function kineskiZnakZaDatum(d: Date): { znak: KineskiZnak; godina: number } | null {
  const g = d.getFullYear();
  const nova = KINESKA_NOVA_GODINA[g];
  if (!nova) return null;

  // Rođeni pre kineske Nove godine pripadaju prethodnoj kineskoj godini.
  const kineskaGodina = d < new Date(nova + 'T00:00:00') ? g - 1 : g;
  const i = ((kineskaGodina - 4) % 12 + 12) % 12;
  return { znak: KINESKI_ZNACI[i], godina: kineskaGodina };
}

export interface Znak {
  naziv: string;
  emoji: string;
  element: 'vatra' | 'zemlja' | 'vazduh' | 'voda';
  od: [number, number];
  do: [number, number];
  osobine: string;
  opis: string;
}

export const ZNACI: Znak[] = [
  { naziv: 'Ovan', emoji: '♈', element: 'vatra', od: [3, 21], do: [4, 19],
    osobine: 'odlučan, energičan, nestrpljiv',
    opis: 'Prvi znak zodijaka, po ovnu sa zlatnim runom iz grčkog mita.' },
  { naziv: 'Bik', emoji: '♉', element: 'zemlja', od: [4, 20], do: [5, 20],
    osobine: 'strpljiv, uporan, staložen',
    opis: 'Po biku u kog se pretvorio Zevs da bi oteo Evropu.' },
  { naziv: 'Blizanci', emoji: '♊', element: 'vazduh', od: [5, 21], do: [6, 20],
    osobine: 'radoznali, brzi, društveni',
    opis: 'Po Kastoru i Poluksu, braći iz grčkog mita koji su i danas dve najsjajnije zvezde tog sazvežđa.' },
  { naziv: 'Rak', emoji: '♋', element: 'voda', od: [6, 21], do: [7, 22],
    osobine: 'osećajan, vezan za dom, brižan',
    opis: 'Po raku koji je u mitu ujeo Herakla dok se borio sa Hidrom.' },
  { naziv: 'Lav', emoji: '♌', element: 'vatra', od: [7, 23], do: [8, 22],
    osobine: 'samouveren, topao, izražajan',
    opis: 'Po nemejskom lavu, prvom Heraklovom zadatku.' },
  { naziv: 'Devica', emoji: '♍', element: 'zemlja', od: [8, 23], do: [9, 22],
    osobine: 'uredna, pažljiva, praktična',
    opis: 'Vezuje se za Demetru, boginju žetve — otud i klas žita u prikazu znaka.' },
  { naziv: 'Vaga', emoji: '♎', element: 'vazduh', od: [9, 23], do: [10, 22],
    osobine: 'skladna, pravična, druželjubiva',
    opis: 'Jedini znak koji nije živo biće. Vezuje se za pravdu i ravnotežu.' },
  { naziv: 'Škorpija', emoji: '♏', element: 'voda', od: [10, 23], do: [11, 21],
    osobine: 'uporna, strastvena, zatvorena',
    opis: 'Po škorpiji koja je u mitu ubola lovca Oriona — zato ta dva sazvežđa nikad nisu na nebu istovremeno.' },
  { naziv: 'Strelac', emoji: '♐', element: 'vatra', od: [11, 22], do: [12, 21],
    osobine: 'otvoren, radoznao, slobodan',
    opis: 'Po kentauru Hironu, učitelju grčkih junaka.' },
  { naziv: 'Jarac', emoji: '♑', element: 'zemlja', od: [12, 22], do: [1, 19],
    osobine: 'ozbiljan, istrajan, odgovoran',
    opis: 'Po morskom jarcu, stvoru sa telom koze i repom ribe.' },
  { naziv: 'Vodolija', emoji: '♒', element: 'vazduh', od: [1, 20], do: [2, 18],
    osobine: 'nezavisna, originalna, radoznala',
    opis: 'Po Ganimedu, koji je u mitu bogovima nosio vodu.' },
  { naziv: 'Ribe', emoji: '♓', element: 'voda', od: [2, 19], do: [3, 20],
    osobine: 'maštovite, osećajne, blage',
    opis: 'Po Afroditi i Erosu, koji su se pretvorili u ribe da pobegnu od čudovišta Tifona.' },
];

export function znakZaDatum(d: Date): Znak {
  const m = d.getMonth() + 1;
  const dan = d.getDate();
  for (const z of ZNACI) {
    const [om, od] = z.od;
    const [dm, dd] = z.do;
    // Jarac prelazi preko Nove godine, pa se njegov opseg proverava obrnuto.
    if (om > dm) {
      if ((m === om && dan >= od) || (m === dm && dan <= dd)) return z;
    } else if ((m === om && dan >= od) || (m === dm && dan <= dd)) {
      return z;
    }
  }
  return ZNACI[9];
}

/**
 * Kineska tablica pola: starost majke (18–45) puta mesec začeća (1–12).
 *
 * Ovo je folklor, ne metod. Tačnost je na nivou bacanja novčića, a same tablice
 * se razlikuju od izvora do izvora. Stranica koja je koristi to i kaže.
 */
const TABLICA: Record<number, string> = {
  18: 'ŽMŽMMMMMMMMM', 19: 'MŽMŽMMMMMMŽŽ', 20: 'ŽMŽMMMMMMMMŽ',
  21: 'MŽŽŽŽŽŽŽŽŽŽŽ', 22: 'ŽMMŽMŽŽMŽŽŽŽ', 23: 'MMŽMMŽMŽMMMŽ',
  24: 'MŽMMŽMŽMŽMMM', 25: 'ŽMMŽŽMŽMŽMMM', 26: 'MŽŽMMŽMŽMŽŽŽ',
  27: 'ŽMŽŽMMŽMMŽMŽ', 28: 'MMŽŽŽMMŽMŽŽM', 29: 'ŽŽMŽMŽMMŽMMM',
  30: 'MŽŽŽŽŽŽŽŽMMM', 31: 'MŽMŽŽŽŽŽMŽŽŽ', 32: 'MŽMŽMŽŽŽMŽŽŽ',
  33: 'ŽMŽMŽMŽŽŽMŽM', 34: 'MŽMŽMŽŽŽŽMMŽ', 35: 'MMŽMŽMŽŽMŽMŽ',
  36: 'ŽMMŽMŽMŽMMMM', 37: 'MŽMMŽMŽMŽMŽM', 38: 'ŽMŽMMŽMŽMŽMŽ',
  39: 'MŽMMMMŽMŽMŽŽ', 40: 'ŽMŽMŽMMŽMŽMM', 41: 'MŽMŽMŽMMŽMŽŽ',
  42: 'ŽMŽMŽMŽMMŽMM', 43: 'MŽŽŽMMMMMŽMŽ', 44: 'MMMŽŽMŽMMMŽM',
  45: 'ŽMŽMMŽMŽŽMŽM',
};

export const NAJMANJA_STAROST = 18;
export const NAJVECA_STAROST = 45;

/** Vraća 'muško' ili 'žensko' po tablici, ili null ako je unos van opsega. */
export function polPoTablici(starost: number, mesecZaceca: number): 'muško' | 'žensko' | null {
  const red = TABLICA[starost];
  if (!red || mesecZaceca < 1 || mesecZaceca > 12) return null;
  return red[mesecZaceca - 1] === 'M' ? 'muško' : 'žensko';
}
