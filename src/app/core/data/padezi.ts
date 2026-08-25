/**
 * Promena imena kroz padeže.
 *
 * Radi se o pravilima, ne o rečniku, pa se izuzeci moraju hvatati posebno.
 * Tri stvari najčešće obore naivnu deklinaciju:
 *
 *  1. nepostojano a — Aleksandar → Aleksandra, ne „Aleksandara"
 *  2. palatalizacija u vokativu — Vuk → Vuče, Miloš → Miloše
 *  3. imena na -ica u vokativu — Milica → Milice, ne „Milico"
 *
 * Gde pravilo ne može pouzdano da pogodi, funkcija vraća null i stranica
 * jednostavno ne prikazuje padeže. Pogrešna promena je gora od nikakve.
 */

export interface Padezi {
  nominativ: string;
  genitiv: string;
  dativ: string;
  akuzativ: string;
  vokativ: string;
  instrumental: string;
  lokativ: string;
}

/** Suglasnici posle kojih u instrumentalu ide -em umesto -om. */
const MEKI = ['j', 'lj', 'nj', 'č', 'ć', 'ž', 'š', 'đ'];

function zavrsavaSe(ime: string, nastavci: string[]): boolean {
  return nastavci.some(n => ime.toLowerCase().endsWith(n));
}

/**
 * Imena kod kojih se „a" gubi u zavisnim padežima.
 *
 * Pravilom se ne može pogoditi: Petar → Petra, ali Lazar → Lazara, iako oba
 * izgledaju isto. Zato spisak, a ne obrazac.
 */
const NEPOSTOJANO_A = new Set(['Aleksandar', 'Petar', 'Aleksandra']);

function osnovaMuskog(ime: string): string {
  if (NEPOSTOJANO_A.has(ime)) return ime.slice(0, -2) + ime.slice(-1);
  return ime;
}

function instrumentalniNastavak(osnova: string): string {
  return zavrsavaSe(osnova, MEKI) ? 'em' : 'om';
}

/** Vokativ muških imena na suglasnik — tu palatalizacija pravi najviše štete. */
function vokativMuskog(ime: string, osnova: string): string | null {
  const m = ime.toLowerCase();
  if (m.endsWith('k')) return osnova.slice(0, -1) + 'če';   // Vuk → Vuče
  if (m.endsWith('g')) return osnova.slice(0, -1) + 'že';   // Dragutin-tip
  if (m.endsWith('h')) return osnova.slice(0, -1) + 'še';
  // Miloš → Miloše, Uroš → Uroše. Na -u idu samo imena na -j, -lj, -nj, -c.
  if (zavrsavaSe(m, ['j', 'lj', 'nj', 'c'])) return osnova + 'u';
  return osnova + 'e';
}

export function padeziZaIme(ime: string, pol: 'z' | 'm'): Padezi | null {
  const kraj = ime.toLowerCase();

  // Imena na -a menjaju se isto bez obzira na pol: Ana, Nikola, Luka.
  if (kraj.endsWith('a')) {
    const o = ime.slice(0, -1);
    // Milica → Milice, Danica → Danice; ostala ženska idu na -o.
    const vokativ = pol === 'z'
      ? (kraj.endsWith('ica') ? o + 'e' : o + 'o')
      : o + 'a';
    return {
      nominativ: ime,
      genitiv: o + 'e',
      dativ: o + 'i',
      akuzativ: o + 'u',
      vokativ,
      // Uvek -om: Marijom, Mašom, Milicom. Meko/tvrdo razlikovanje ovde ne važi.
      instrumental: o + 'om',
      lokativ: o + 'i',
    };
  }

  if (pol === 'm') {
    // Marko, Darko — na -o.
    if (kraj.endsWith('o') || kraj.endsWith('e')) {
      const o = ime.slice(0, -1);
      return {
        nominativ: ime,
        genitiv: o + 'a',
        dativ: o + 'u',
        akuzativ: o + 'a',
        vokativ: ime,
        instrumental: o + instrumentalniNastavak(o),
        lokativ: o + 'u',
      };
    }

    // Na suglasnik: Stefan, Aleksandar, Vuk.
    const o = osnovaMuskog(ime);
    const vok = vokativMuskog(ime, o);
    if (!vok) return null;
    return {
      nominativ: ime,
      genitiv: o + 'a',
      dativ: o + 'u',
      akuzativ: o + 'a',
      vokativ: vok,
      instrumental: o + instrumentalniNastavak(o),
      lokativ: o + 'u',
    };
  }

  // Ženska imena na suglasnik (Ines, Nikol) u govoru ostaju nepromenjena —
  // menja se ono što stoji uz njih. Prikaz padeža tu ne bi bio tačan.
  return null;
}
