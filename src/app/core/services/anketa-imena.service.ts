import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { IMENA } from '../data/imena';

export interface Anketa {
  id: string;
  kod: string;
  naslov: string | null;
  imena: string[];
  created_at: string;
}

export interface Rezultat {
  ime: string;
  glasova: number;
}

/**
 * Ankete za ime — porodica glasa preko deljenog linka.
 *
 * Bez prijave, i to namerno: link se šalje baki i tetki, a one neće otvarati
 * nalog. Zaštita je u tome što se anketa nalazi samo preko svog koda.
 */
@Injectable({ providedIn: 'root' })
export class AnketaImenaService {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);

  private static readonly KLJUC_GLASACA = 'dnevnik-glasac';

  /**
   * Oznaka uređaja, da isti pregledač ne glasa dvaput.
   *
   * Nije prijava niti praćenje: nasumičan niz koji ostaje u ovom pregledaču i
   * ne kazuje ništa o osobi. Ko obriše podatke sajta, može da glasa ponovo —
   * to je prihvatljivo za porodičnu anketu.
   */
  private oznakaGlasaca(): string {
    let o = localStorage.getItem(AnketaImenaService.KLJUC_GLASACA);
    if (!o) {
      o = crypto.randomUUID();
      localStorage.setItem(AnketaImenaService.KLJUC_GLASACA, o);
    }
    return o;
  }

  /** Kratak kod bez slova koja se mešaju (0/O, 1/l/I). */
  private noviKod(): string {
    const azbuka = 'abcdefghjkmnpqrstuvwxyz23456789';
    return Array.from(
      crypto.getRandomValues(new Uint8Array(10)),
      b => azbuka[b % azbuka.length],
    ).join('');
  }

  async napravi(imena: string[], naslov: string): Promise<string> {
    const kod = this.noviKod();
    const { error } = await this.supabase.client.from('ankete_imena').insert({
      kod,
      naslov: naslov.trim() || null,
      imena,
      user_id: this.auth.user()?.id ?? null,
    });
    if (error) throw error;

    // Beleži se šta ljudi upisuju mimo spiska — to je spisak imena koja nam
    // fale, sastavljen od korisnica. Ne ulazi nigde samo; admin kasnije bira
    // šta vredi dodati. Namerno se ne čeka: ako ovo padne, anketa je već
    // napravljena i ne treba da trpi.
    void this.zabeleziNepoznata(imena);

    return kod;
  }

  private async zabeleziNepoznata(imena: string[]) {
    const naSpisku = new Set(IMENA.map(i => i.ime.toLowerCase()));
    for (const ime of imena) {
      if (naSpisku.has(ime.trim().toLowerCase())) continue;
      await this.supabase.client
        .rpc('zabelezi_predlozeno_ime', { p_ime: ime })
        .then(() => undefined, () => undefined);
    }
  }

  async ucitaj(kod: string): Promise<Anketa | null> {
    const { data } = await this.supabase.client
      .from('ankete_imena')
      .select('id, kod, naslov, imena, created_at')
      .eq('kod', kod)
      .maybeSingle();
    return (data as Anketa) ?? null;
  }

  async rezultati(anketaId: string, imena: string[]): Promise<Rezultat[]> {
    const { data } = await this.supabase.client
      .from('glasovi_imena')
      .select('ime')
      .eq('anketa_id', anketaId);

    const broj = new Map<string, number>(imena.map(i => [i, 0]));
    for (const g of (data as { ime: string }[]) ?? []) {
      broj.set(g.ime, (broj.get(g.ime) ?? 0) + 1);
    }
    return [...broj.entries()]
      .map(([ime, glasova]) => ({ ime, glasova }))
      .sort((a, b) => b.glasova - a.glasova || a.ime.localeCompare(b.ime, 'sr-Latn-RS'));
  }

  /** Vraća false ako je sa ovog uređaja već glasano. */
  async glasaj(anketaId: string, ime: string): Promise<boolean> {
    const { error } = await this.supabase.client.from('glasovi_imena').insert({
      anketa_id: anketaId,
      ime,
      glasac: this.oznakaGlasaca(),
    });
    // 23505 je jedinstveni indeks (anketa_id, glasac) — znači da je već glasano.
    if (error) return false;
    return true;
  }

  async vecGlasao(anketaId: string): Promise<string | null> {
    const { data } = await this.supabase.client
      .from('glasovi_imena')
      .select('ime')
      .eq('anketa_id', anketaId)
      .eq('glasac', this.oznakaGlasaca())
      .maybeSingle();
    return (data as { ime: string } | null)?.ime ?? null;
  }
}
