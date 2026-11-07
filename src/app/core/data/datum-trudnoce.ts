/**
 * Računanje i provera datuma trudnoće — na jednom mestu, da podešavanje
 * i Profil uvek daju isti rezultat.
 *
 * Najčešća greška u praksi: u polje „poslednja menstruacija" upiše se datum
 * termina (u budućnosti). Tada se trudnoća računa kao „0. nedelja" i deluje
 * kao da aplikacija ne radi. Zato se datum proverava pre čuvanja, a za
 * budući datum se nudi da se tumači kao termin.
 */
import { LOKAL } from './lokalizacija';

export type VrstaDatuma = 'menstruacija' | 'termin';

const DAN_MS = 86_400_000;
const TRAJANJE_DANA = 280;
/** Do koliko dana posle termina još ima smisla voditi trudnoću. */
const POSLE_TERMINA_DANA = 21;

/** Danas u ponoć, lokalno — da sat u danu ne pomera nedelju. */
function danas(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** 'YYYY-MM-DD' → lokalni datum u ponoć (bez pomeranja vremenske zone). */
export function izIso(iso: string): Date {
  const [g, m, d] = iso.split('-').map(Number);
  return new Date(g, (m ?? 1) - 1, d ?? 1);
}

export function uIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dan = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dan}`;
}

function dodajDane(d: Date, dana: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + dana);
  return r;
}

export function terminIzMenstruacije(iso: string): string {
  return uIso(dodajDane(izIso(iso), TRAJANJE_DANA));
}

export function menstruacijaIzTermina(iso: string): string {
  return uIso(dodajDane(izIso(iso), -TRAJANJE_DANA));
}

/** Termin za uneti datum, bez obzira koja je vrsta datuma uneta. */
export function terminZa(vrsta: VrstaDatuma, iso: string): string {
  return vrsta === 'termin' ? iso : terminIzMenstruacije(iso);
}

/** Broj dana trudnoće danas za dati termin (može biti < 0 ili > 280). */
export function danaTrudnoce(terminIso: string): number {
  const preostalo = Math.round((izIso(terminIso).getTime() - danas().getTime()) / DAN_MS);
  return TRAJANJE_DANA - preostalo;
}

export interface Procena {
  nedelja: number;
  dan: number;
  terminTekst: string;
}

export function proceni(terminIso: string): Procena {
  const dana = Math.max(danaTrudnoce(terminIso), 0);
  return {
    nedelja: Math.floor(dana / 7),
    dan: dana % 7,
    terminTekst: izIso(terminIso).toLocaleDateString(LOKAL, { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

export interface GreskaDatuma {
  poruka: string;
  /**
   * Kad je uneta „menstruacija" u budućnosti, a datum liči na termin —
   * nudi se jedan dodir da se protumači kao termin.
   */
  mozdaJeTermin?: boolean;
}

/** Vraća grešku razumljivu korisnici, ili null ako je datum u redu. */
export function proveriDatum(vrsta: VrstaDatuma, iso: string): GreskaDatuma | null {
  if (!iso) return { poruka: 'Izaberi datum da nastaviš.' };
  const datum = izIso(iso);
  if (isNaN(datum.getTime())) return { poruka: 'Datum nije ispravan. Izaberi ga ponovo.' };

  const razlika = Math.round((datum.getTime() - danas().getTime()) / DAN_MS);

  if (vrsta === 'menstruacija') {
    if (razlika > 0) {
      const liciNaTermin = razlika <= TRAJANJE_DANA + 14;
      return {
        poruka: 'Ovaj datum je u budućnosti. Ovde se upisuje prvi dan poslednje menstruacije — ona je bila pre trudnoće.',
        mozdaJeTermin: liciNaTermin,
      };
    }
    if (-razlika > TRAJANJE_DANA + POSLE_TERMINA_DANA) {
      return { poruka: 'Ovaj datum je pre više od 10 meseci. Proveri godinu — možda je izabrana pogrešna.' };
    }
    return null;
  }

  if (-razlika > POSLE_TERMINA_DANA) {
    return { poruka: 'Ovaj termin je već prošao. Proveri datum i godinu.' };
  }
  if (razlika > TRAJANJE_DANA + 14) {
    return { poruka: 'Ovaj termin je dalje od 9 meseci. Proveri godinu — možda je izabrana pogrešna.' };
  }
  return null;
}
