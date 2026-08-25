/**
 * Jezički kod za sve datume, vreme i sortiranje u aplikaciji.
 *
 * Mora biti `sr-Latn-RS`, ne `sr-RS`: goli `sr-RS` vraća ćirilicu, pa se u
 * latiničnoj aplikaciji pojavi „31. децембар 2026." usred latiničnog teksta.
 * Stoji na jednom mestu da se greška ne bi vratila kroz novi ekran.
 */
export const LOKAL = 'sr-Latn-RS';

/** Meseci u genitivu — „17. februara", kako se datum i izgovara u rečenici. */
const MESECI_GENITIV = [
  'januara', 'februara', 'marta', 'aprila', 'maja', 'juna',
  'jula', 'avgusta', 'septembra', 'oktobra', 'novembra', 'decembra',
];

/**
 * Datum za sredinu rečenice: „Nova godina je bila 17. februara 2026".
 *
 * `toLocaleDateString` daje nominativ i završnu tačku („17. februar 2026."),
 * što usred rečenice ispadne i negramatično i sa duplom tačkom.
 */
export function datumURecenici(d: Date): string {
  return `${d.getDate()}. ${MESECI_GENITIV[d.getMonth()]} ${d.getFullYear()}`;
}
