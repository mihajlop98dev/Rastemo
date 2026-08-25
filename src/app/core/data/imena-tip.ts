/**
 * Značenja imena.
 *
 * Etimologija je stvarna nauka, za razliku od većine sadržaja o imenima na
 * srpskom internetu, koji je uglavnom prepisivan i često netačan. Zato se ovde
 * uz svako ime navodi i poreklo, a značenja se drže onoga što je jezički
 * potvrđeno — bez izmišljenih „energija imena" i sličnog.
 *
 * Gde je značenje sporno ili postoji više tumačenja, to se kaže otvoreno
 * umesto da se bira jedno i predstavi kao sigurno.
 */
export type Pol = 'z' | 'm';

export type Poreklo =
  | 'slovensko'
  | 'grčko'
  | 'hebrejsko'
  | 'latinsko'
  | 'staronemačko'
  | 'persijsko'
  | 'tursko'
  | 'keltsko'
  | 'nepoznato';

/**
 * Koliko je ime često.
 *
 * Republički zavod za statistiku objavljuje samo prvih deset imena, i to bez
 * broja nosilaca. Zato se ovde ne izmišlja procena za svako ime — navodi se
 * mesto na listi gde postoji, a gde ne postoji ne piše ništa.
 *
 * Poređenje dve liste je i najzanimljiviji podatak: Jelena je najčešće žensko
 * ime u Srbiji, ali među novorođenima nije ni u prvih deset. Ime stari.
 */
export interface Ucestalost {
  /** Mesto među 10 najčešćih imena novorođenih 2025. (RZS) */
  novorodjeni2025?: number;
  /** Mesto među 10 najčešćih imena u populaciji, popis 2022. (RZS) */
  popis2022?: number;
}

export interface Ime {
  ime: string;
  pol: Pol;
  poreklo: Poreklo;
  /** Kratko značenje, jedna linija — ono što se prikazuje u spisku. */
  znacenje: string;
  /** Dva-tri reda: odakle dolazi i kako je došlo do nas. */
  objasnjenje: string;
  /** Domaće i strane varijante istog imena. */
  varijante?: string[];
  /** Postoji samo za imena koja su na nekoj od zvaničnih lista. */
  ucestalost?: Ucestalost;
}

/** Rečenica o učestalosti, ili prazno ako podatak ne postoji. */
export function tekstUcestalosti(i: Ime): string | null {
  const u = i.ucestalost;
  if (!u) return null;

  const delovi: string[] = [];
  if (u.novorodjeni2025) {
    delovi.push(`${u.novorodjeni2025}. mesto među imenima novorođenih u 2025.`);
  }
  if (u.popis2022) {
    delovi.push(`${u.popis2022}. mesto po broju nosilaca u Srbiji (popis 2022)`);
  }
  if (!delovi.length) return null;

  // Ime koje je često u populaciji, a ne i među bebama, znači da izlazi iz mode.
  if (u.popis2022 && !u.novorodjeni2025) {
    return `${delovi.join('; ')}. Danas se retko daje novorođenima.`;
  }
  if (u.novorodjeni2025 && !u.popis2022) {
    return `${delovi.join('; ')}. Ime je u naglom usponu — ranije je bilo retko.`;
  }
  return delovi.join('; ') + '.';
}

/** Adresa stranice: bez dijakritike, malim slovima. */
export function slugZaIme(ime: string): string {
  return ime
    .toLowerCase()
    .replace(/č|ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/đ/g, 'dj')
    .replace(/[^a-z]/g, '');
}

/** Genitiv — za rečenice tipa „ime slovenskog porekla". */
export const POREKLO_GENITIV: Record<Poreklo, string> = {
  slovensko: 'slovenskog',
  grčko: 'grčkog',
  hebrejsko: 'hebrejskog',
  latinsko: 'latinskog',
  staronemačko: 'staronemačkog',
  persijsko: 'persijskog',
  tursko: 'turskog',
  keltsko: 'keltskog',
  nepoznato: 'nepoznatog',
};

export const OZNAKA_POREKLA: Record<Poreklo, string> = {
  slovensko: 'slovensko',
  grčko: 'grčko',
  hebrejsko: 'hebrejsko',
  latinsko: 'latinsko',
  staronemačko: 'staronemačko',
  persijsko: 'persijsko',
  tursko: 'tursko',
  keltsko: 'keltsko',
  nepoznato: 'nepoznatog porekla',
};
