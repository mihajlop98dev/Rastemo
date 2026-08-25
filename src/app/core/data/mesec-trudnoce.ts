/**
 * Nedelja trudnoće → mesec trudnoće.
 *
 * Trudnoća traje 40 nedelja, što nije tačno devet kalendarskih meseci — zato
 * podela nije ravnomerna i meseci nemaju isti broj nedelja. Ovo je raspodela
 * koju koriste ginekolozi kod nas i koja se poklapa sa tim kako žene same
 * govore o trudnoći („u petom sam mesecu").
 */
interface MesecOpseg {
  mesec: number;
  odNedelje: number;
  doNedelje: number;
}

const MESECI: MesecOpseg[] = [
  { mesec: 1, odNedelje: 1, doNedelje: 4 },
  { mesec: 2, odNedelje: 5, doNedelje: 8 },
  { mesec: 3, odNedelje: 9, doNedelje: 13 },
  { mesec: 4, odNedelje: 14, doNedelje: 17 },
  { mesec: 5, odNedelje: 18, doNedelje: 22 },
  { mesec: 6, odNedelje: 23, doNedelje: 27 },
  { mesec: 7, odNedelje: 28, doNedelje: 31 },
  { mesec: 8, odNedelje: 32, doNedelje: 35 },
  { mesec: 9, odNedelje: 36, doNedelje: 40 },
];

/**
 * Vraća mesec za datu nedelju. Nedelje preko 40. i dalje spadaju u deveti
 * mesec — trudnoća koja pređe termin nije prešla u deseti.
 */
export function mesecZaNedelju(nedelja: number): number {
  if (nedelja < 1) return 1;
  const nadjen = MESECI.find(m => nedelja >= m.odNedelje && nedelja <= m.doNedelje);
  return nadjen ? nadjen.mesec : 9;
}

const REDNI = ['', 'prvom', 'drugom', 'trećem', 'četvrtom', 'petom', 'šestom', 'sedmom', 'osmom', 'devetom'];

/** „u petom mesecu" — onako kako se kaže naglas. */
export function mesecURecenici(nedelja: number): string {
  const m = mesecZaNedelju(nedelja);
  return `u ${REDNI[m]} mesecu`;
}

/** Koje nedelje pokriva dati mesec — za objašnjenje uz prikaz. */
export function opsegMeseca(mesec: number): { od: number; do: number } | null {
  const m = MESECI.find(x => x.mesec === mesec);
  return m ? { od: m.odNedelje, do: m.doNedelje } : null;
}
