/**
 * Jezički kod za sve datume, vreme i sortiranje u aplikaciji.
 *
 * Mora biti `sr-Latn-RS`, ne `sr-RS`: goli `sr-RS` vraća ćirilicu, pa se u
 * latiničnoj aplikaciji pojavi „31. децембар 2026." usred latiničnog teksta.
 * Stoji na jednom mestu da se greška ne bi vratila kroz novi ekran.
 */
export const LOKAL = 'sr-Latn-RS';
