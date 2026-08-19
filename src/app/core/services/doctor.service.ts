import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface DoctorRow {
  id: string;
  full_name: string;
  specialty: string;
  city: string | null;
  clinic_id: string | null;
  is_verified: boolean;
  avg_rating: number;
  review_count: number;
  title: string | null;
  subspecialty: string | null;
  academic_title: string | null;
  is_primarius: boolean;
  license_number: string | null;
  license_valid_until: string | null;
  source: string | null;
  clinics: { name: string } | null;
}

const IZBOR = '*, clinics(name)';

/** Registar Komore ima blizu dve hiljade ginekologa. Cela lista se ne prenosi
 *  u pregledač — pretraga i stranicanje idu na server. */
export const STRANA = 40;

@Injectable({ providedIn: 'root' })
export class DoctorService {
  readonly all = signal<DoctorRow[]>([]);
  readonly topRated = signal<DoctorRow[]>([]);
  /** Samo unosi korisnica — administracija ne treba da pregleda registar Komore. */
  readonly userAdded = signal<DoctorRow[]>([]);
  readonly loading = signal(false);
  readonly ukupno = signal(0);
  readonly imaJos = signal(false);

  private pojam = '';
  private strana = 0;

  constructor(private supabase: SupabaseService) {}

  /** Prvi ekran: lekari koji već imaju grad i ocenu idu na vrh — unos iz
   *  registra bez ijednog dodatnog podatka korisnici ništa ne govori. */
  async loadAll() {
    await this.search('');
  }

  async search(pojam: string) {
    this.pojam = pojam.trim();
    this.strana = 0;
    this.loading.set(true);
    const { redovi, ukupno } = await this.upit(0);
    this.all.set(redovi);
    this.ukupno.set(ukupno);
    this.imaJos.set(redovi.length < ukupno);
    this.loading.set(false);
  }

  async loadMore() {
    if (this.loading() || !this.imaJos()) return;
    this.loading.set(true);
    this.strana += 1;
    const { redovi, ukupno } = await this.upit(this.strana);
    const spojeno = [...this.all(), ...redovi];
    this.all.set(spojeno);
    this.imaJos.set(spojeno.length < ukupno);
    this.loading.set(false);
  }

  private async upit(strana: number) {
    let q = this.supabase.client
      .from('doctors')
      .select(IZBOR, { count: 'exact' });

    if (this.pojam) {
      // or() razdvaja uslove zarezom i grupiše zagradama, pa bi ih pojam koji ih
      // sadrži razbio i vratio 400.
      const p = `%${this.pojam.replace(/[,()]/g, ' ')}%`;
      q = q.or(`full_name.ilike.${p},city.ilike.${p},specialty.ilike.${p}`);
    }

    const { data, count } = await q
      .order('review_count', { ascending: false })
      .order('city', { ascending: true, nullsFirst: false })
      .order('full_name', { ascending: true })
      .range(strana * STRANA, strana * STRANA + STRANA - 1);

    return { redovi: (data as DoctorRow[]) ?? [], ukupno: count ?? 0 };
  }

  async loadTopRated() {
    const { data } = await this.supabase.client
      .from('doctors')
      .select(IZBOR)
      .gt('review_count', 0)
      .order('avg_rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(5);
    this.topRated.set((data as DoctorRow[]) ?? []);
  }

  async loadUserAdded() {
    const { data } = await this.supabase.client
      .from('doctors')
      .select(IZBOR)
      .not('added_by', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);
    this.userAdded.set((data as DoctorRow[]) ?? []);
  }

  async byIds(ids: string[]) {
    if (!ids.length) return [];
    const { data } = await this.supabase.client
      .from('doctors')
      .select(IZBOR)
      .in('id', ids)
      .order('full_name');
    return (data as DoctorRow[]) ?? [];
  }

  /** Predlozi u obrascu za dodavanje — da se lekar iz registra ne unese po drugi put. */
  async predlozi(ime: string) {
    const p = ime.trim();
    if (p.length < 3) return [];
    const { data } = await this.supabase.client
      .from('doctors')
      .select(IZBOR)
      .ilike('full_name', `%${p}%`)
      .order('full_name')
      .limit(6);
    return (data as DoctorRow[]) ?? [];
  }

  async create(dto: { full_name: string; specialty: string; city?: string; clinic_id?: string | null }) {
    const { data: authData } = await this.supabase.client.auth.getUser();
    const { data, error } = await this.supabase.client
      .from('doctors')
      .insert({ ...dto, added_by: authData.user?.id, source: 'Unos korisnice' })
      .select(IZBOR)
      .single();

    if (error) throw error;
    this.all.update(list => [data as DoctorRow, ...list]);
    return data as DoctorRow;
  }

  /** Dopunjava grad i ustanovu lekaru iz registra. Ime, licenca i specijalizacija
   *  se ne diraju — to sprovodi funkcija u bazi, ne ovaj poziv. */
  async dopuni(doctorId: string, city?: string, clinicId?: string | null) {
    const { data, error } = await this.supabase.client.rpc('dopuni_lekara', {
      p_doctor_id: doctorId,
      p_city: city ?? null,
      p_clinic_id: clinicId ?? null,
    });
    if (error) throw error;

    const [svez] = await this.byIds([doctorId]);
    if (svez) this.all.update(list => list.map(d => (d.id === doctorId ? svez : d)));
    return (svez ?? data) as DoctorRow;
  }
}
