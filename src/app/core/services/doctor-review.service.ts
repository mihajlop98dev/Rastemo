import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface OcenaRow {
  id: string;
  rating: number;
  comment: string | null;
  is_anonymous: boolean;
  created_at: string;
  /** Prazno kad je ocena anonimna — baza ime tada uopšte ne vraća. */
  autor: string | null;
  moja: boolean;
}

export interface KomentarRow {
  id: string;
  body: string;
  is_anonymous: boolean;
  created_at: string;
  autor: string | null;
  moj: boolean;
}

@Injectable({ providedIn: 'root' })
export class DoctorReviewService {
  readonly ocene = signal<OcenaRow[]>([]);
  readonly loading = signal(false);
  /** Komentari po id-u ocene; učitavaju se tek kad se ocena razvije. */
  readonly komentari = signal<Record<string, KomentarRow[]>>({});

  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  /**
   * Ocene se ne čitaju direktno iz tabele nego kroz funkciju: spajanje sa
   * profilima na klijentu bi značilo da se uz anonimnu ocenu ipak prenese
   * user_id, pa anonimnost ne bi vredela ništa.
   */
  async load(doctorId: string) {
    this.loading.set(true);
    const { data, error } = await this.supabase.client.rpc('ocene_lekara', { p_doctor_id: doctorId });
    this.ocene.set(error ? [] : ((data as OcenaRow[]) ?? []));
    this.komentari.set({});
    this.loading.set(false);
  }

  /** Ocena koju je ostavila prijavljena korisnica, ako postoji. */
  get moja(): OcenaRow | undefined {
    return this.ocene().find(o => o.moja);
  }

  /**
   * Upis ide kroz funkciju u bazi, ne direktnim upsertom.
   *
   * Kolona user_id je zatvorena za čitanje da anonimnost ne bi bila probojna,
   * a upsert sa "on conflict (doctor_id, user_id)" mora da je pročita. Funkcija
   * uzima korisnika iz auth.uid(), pa se id nikada ne šalje sa klijenta.
   */
  async sacuvaj(doctorId: string, rating: number, comment: string, anonimno: boolean) {
    const { error } = await this.supabase.client.rpc('sacuvaj_ocenu', {
      p_doctor_id: doctorId,
      p_rating: rating,
      p_comment: comment.trim() || null,
      p_anonimno: anonimno,
    });
    if (error) throw error;
    await this.load(doctorId);
  }

  async obrisi(doctorId: string, reviewId: string) {
    const { error } = await this.supabase.client.rpc('obrisi_moju_ocenu', { p_review_id: reviewId });
    if (error) throw error;
    await this.load(doctorId);
  }

  async ucitajKomentare(reviewId: string) {
    const { data, error } = await this.supabase.client.rpc('komentari_ocene', { p_review_id: reviewId });
    this.komentari.update(m => ({ ...m, [reviewId]: error ? [] : ((data as KomentarRow[]) ?? []) }));
  }

  async dodajKomentar(reviewId: string, body: string, anonimno: boolean) {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Potrebna je prijava');

    const { error } = await this.supabase.client
      .from('doctor_review_comments')
      .insert({ review_id: reviewId, user_id: userId, body: body.trim(), is_anonymous: anonimno });

    if (error) throw error;
    await this.ucitajKomentare(reviewId);
  }

  async obrisiKomentar(reviewId: string, komentarId: string) {
    const { error } = await this.supabase.client.rpc('obrisi_moj_komentar', { p_komentar_id: komentarId });
    if (error) throw error;
    await this.ucitajKomentare(reviewId);
  }
}
