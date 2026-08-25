/**
 * Značenja srpskih imena.
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
