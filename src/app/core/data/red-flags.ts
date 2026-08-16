/**
 * Simptomi kod kojih se ne razgovara nego se šalje na hitnu pomoć.
 *
 * Kopija liste iz Edge Function-a, ovde samo da bi odgovor stigao odmah, bez
 * odlaska na mrežu. Merodavna je serverska: aplikacija se može zaobići, pa
 * provera mora da postoji i tamo. Kad menjaš jednu, promeni i drugu.
 */
export const RED_FLAG_PATTERNS: RegExp[] = [
  /krvar/i,
  /krv\b/i,
  /plodov[au]\s*vod/i,
  /pukao\s*vodenjak/i,
  /vodenjak/i,
  /ne\s*ose(ć|c)am\s*(vi(š|s)e\s*)?(pokret|bebu)/i,
  /beba\s*se\s*ne\s*(pomera|mrda|kre(ć|c)e)/i,
  /nema\s*pokret/i,
  /prestal[ai]\s*(je\s*)?da\s*se\s*(mrda|pomera)/i,
  /jak\s*bol/i,
  /ne(š|s)nosn\w*\s*bol/i,
  /gr(č|c)evi/i,
  /mutn\w*\s*vid/i,
  /jak\w*\s*glavobolj/i,
  /oti(č|c)\w*\s*(lice|ruke|(š|s)ake)/i,
  /temperatur\w*\s*(preko\s*)?3[89]/i,
  /onesvest/i,
  /pala\s*sam/i,
  /udarac\s*u\s*stomak/i,
];

export function isRedFlag(text: string): boolean {
  return RED_FLAG_PATTERNS.some(re => re.test(text));
}

export const RED_FLAG_ANSWER =
  'Ovo što opisuješ ne treba da procenjuje aplikacija.\n\n' +
  'Pozovi Hitnu pomoć na 194 ili odmah idi u najbližu bolnicu sa porodilištem. ' +
  'Ako imaš broj svog ginekologa, pozovi i njega usput.\n\n' +
  'Ne čekaj da vidiš hoće li proći samo od sebe. Bolje je otići i saznati da je ' +
  'sve u redu, nego čekati.';
