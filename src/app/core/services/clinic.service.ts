import { Injectable, signal } from '@angular/core';
import { LOKAL } from '../data/lokalizacija';
import { SupabaseService } from './supabase.service';

export interface ClinicRow {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  /** Tačka je centar grada, ne sama ustanova — mapa to mora da prizna. */
  lokacija_priblizna: boolean;
}

@Injectable({ providedIn: 'root' })
export class ClinicService {
  readonly all = signal<ClinicRow[]>([]);
  readonly loading = signal(false);

  private loaded = false;

  constructor(private supabase: SupabaseService) {}

  /** Lista je mala i retko se menja, pa se učitava jednom po sesiji. */
  async load(force = false) {
    if (this.loaded && !force) return;

    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('clinics')
      .select('id, name, city, address, phone, lat, lng, lokacija_priblizna')
      .order('name');

    this.all.set((data as ClinicRow[]) ?? []);
    this.loaded = true;
    this.loading.set(false);
  }

  byId(id: string | null): ClinicRow | null {
    if (!id) return null;
    return this.all().find(c => c.id === id) ?? null;
  }

  /** Pretraga bez obzira na dijakritike — "Cacak" nalazi "Čačak". */
  search(term: string): ClinicRow[] {
    const t = fold(term);
    if (!t) return this.all();
    return this.all().filter(c => fold(c.name).includes(t) || fold(c.city ?? '').includes(t));
  }

  /**
   * Ostaje samo za administraciju — RLS dozvoljava unos ustanove isključivo
   * administratoru. Korisnice ustanovu biraju sa spiska; pogrešna adresa
   * porodilišta je greška koju one ne bi prepoznale.
   */
  async create(dto: { name: string; city?: string; address?: string; phone?: string }) {
    const { data, error } = await this.supabase.client
      .from('clinics')
      .insert({
        name: dto.name,
        city: dto.city || null,
        address: dto.address || null,
        phone: dto.phone || null,
      })
      .select('id, name, city, address, phone, lat, lng, lokacija_priblizna')
      .single();

    if (error) throw error;

    const row = data as ClinicRow;
    this.all.update(list => [...list, row].sort((a, b) => a.name.localeCompare(b.name, LOKAL)));
    return row;
  }
}

function fold(s: string): string {
  return s
    .toLowerCase()
    .replace(/č|ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/đ/g, 'd')
    .trim();
}
