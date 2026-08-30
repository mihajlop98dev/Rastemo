import { Ime, slugZaIme } from './imena-tip';
import { ZENSKA_IMENA } from './imena-zenska';
import { MUSKA_IMENA } from './imena-muska';

export * from './imena-tip';

/** Sva imena, sortirana srpskim redosledom. */
export const IMENA: Ime[] = [...ZENSKA_IMENA, ...MUSKA_IMENA]
  .sort((a, b) => a.ime.localeCompare(b.ime, 'sr-Latn-RS'));

const PO_SLUGU = new Map(IMENA.map(i => [slugZaIme(i.ime), i]));

export function imeZaSlug(slug: string): Ime | undefined {
  return PO_SLUGU.get(slug);
}

/** Imena istog porekla — koriste se kao predlozi na stranici imena. */
/**
 * Imena srodna datom.
 *
 * Ranije se uzimalo prvih šest istog porekla, pa je Dunja nudila Biljanu,
 * Blaženku i Bogdanu — prosto prva slovenska imena po abecedi. To nikome nije
 * značilo ništa. Sada se redom traži pravo srodstvo:
 *
 *  1. imena navedena kao varijante (Ana → Anica, Anja)
 *  2. imena koja dele isto značenje (Bogdana → Teodora)
 *  3. tek na kraju dopuna po poreklu, i to razuđeno kroz azbuku umesto
 *     prvih šest zaredom
 */
export function slicnaImena(ime: Ime, koliko = 6): Ime[] {
  const izabrano: Ime[] = [];
  const uzeto = new Set([ime.ime]);

  const dodaj = (kandidati: Ime[]) => {
    for (const k of kandidati) {
      if (izabrano.length >= koliko) return;
      if (uzeto.has(k.ime)) continue;
      uzeto.add(k.ime);
      izabrano.push(k);
    }
  };

  const varijante = new Set(ime.varijante ?? []);
  dodaj(IMENA.filter(i => varijante.has(i.ime) || (i.varijante ?? []).includes(ime.ime)));

  const kljucneReci = ime.znacenje.toLowerCase().split(/[,;]/).map(r => r.trim()).filter(r => r.length > 3);
  dodaj(IMENA.filter(i =>
    i.pol === ime.pol
    && kljucneReci.some(r => i.znacenje.toLowerCase().includes(r)),
  ));

  // Razuđeno uzimanje: iz spiska istog porekla bira se svako n-to ime, da
  // predlozi ne budu uvek isti početak azbuke.
  const istoPoreklo = IMENA.filter(i => i.pol === ime.pol && i.poreklo === ime.poreklo && !uzeto.has(i.ime));
  const korak = Math.max(1, Math.floor(istoPoreklo.length / Math.max(1, koliko - izabrano.length)));
  dodaj(istoPoreklo.filter((_, i) => i % korak === 0));
  dodaj(istoPoreklo);

  return izabrano;
}
