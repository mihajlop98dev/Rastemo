/**
 * Prevod grešaka na srpski.
 *
 * Supabase vraća poruke na engleskom („Invalid login credentials",
 * „Database error saving new user"...). Korisnica ih ne razume, pa svaka
 * poruka koja stiže do ekrana prolazi kroz ovu funkciju.
 *
 * Poruke koje već dolaze na srpskom (iz naših okidača u bazi) prolaze
 * nepromenjene.
 */

const PREVODI: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'Pogrešan email ili lozinka.'],
  [/email not confirmed/i, 'Mejl još nije potvrđen. Otvori link iz mejla koji smo ti poslali.'],
  [/user already registered|already been registered/i, 'Nalog sa ovim mejlom već postoji. Prijavi se ili izaberi „Zaboravljena lozinka".'],
  [/password should be at least|password.*(short|characters)/i, 'Lozinka mora da ima bar 6 karaktera.'],
  [/new password should be different/i, 'Nova lozinka mora da bude drugačija od stare.'],
  [/unable to validate email|invalid.*email|email.*invalid/i, 'Mejl adresa nije ispravna. Proveri da li je dobro upisana.'],
  [/rate limit|too many requests|for security purposes/i, 'Previše pokušaja zaredom. Sačekaj minut pa pokušaj ponovo.'],
  [/failed to fetch|networkerror|network request failed|load failed/i, 'Nema veze sa internetom. Proveri internet pa pokušaj ponovo.'],
  [/database error saving new user/i, 'Nalog nije napravljen. Proveri korisničko ime (bar 3 slova ili broja, bez razmaka) i pokušaj ponovo.'],
  [/jwt expired|invalid jwt|session.*(missing|expired)|not authenticated|auth session missing/i, 'Sesija je istekla. Prijavi se ponovo.'],
  [/duplicate key|already exists|unique constraint/i, 'To već postoji. Izaberi nešto drugo.'],
  [/row-level security|permission denied|violates row-level/i, 'Ovo trenutno ne može da se sačuva. Osveži stranicu i pokušaj ponovo.'],
  [/popup|provider is not enabled/i, 'Prijava preko Google-a trenutno ne radi. Probaj sa mejlom i lozinkom.'],
];

/** Liči li tekst na srpski (latinica sa kvačicama ili česte reči)? */
function jeSrpski(tekst: string): boolean {
  return /[čćšžđČĆŠŽĐ]/.test(tekst) || /\b(nije|mora|ne može|pokušaj|korisničko|lozinka|ime)\b/i.test(tekst);
}

export function porukaGreske(greska: unknown, rezerva = 'Nešto nije u redu. Pokušaj ponovo.'): string {
  const tekst =
    typeof greska === 'string' ? greska :
    (greska as { message?: string } | null)?.message ?? '';
  if (!tekst) return rezerva;

  for (const [uzorak, prevod] of PREVODI) {
    if (uzorak.test(tekst)) return prevod;
  }
  return jeSrpski(tekst) ? tekst : rezerva;
}

/** Da li greška znači da mejl nije potvrđen (za dugme „Pošalji ponovo"). */
export function jeNepotvrdjenMejl(greska: unknown): boolean {
  const tekst = typeof greska === 'string' ? greska : (greska as { message?: string } | null)?.message ?? '';
  return /email not confirmed/i.test(tekst);
}
