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
export function slicnaImena(ime: Ime, koliko = 6): Ime[] {
  return IMENA
    .filter(i => i.ime !== ime.ime && i.pol === ime.pol && i.poreklo === ime.poreklo)
    .slice(0, koliko);
}
