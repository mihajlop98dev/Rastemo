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
  clinics: { name: string } | null;
}

@Injectable({ providedIn: 'root' })
export class DoctorService {
  readonly all = signal<DoctorRow[]>([]);
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService) {}

  async loadAll() {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('doctors')
      .select('*, clinics(name)')
      .order('avg_rating', { ascending: false });

    this.all.set((data as DoctorRow[]) ?? []);
    this.loading.set(false);
  }

  async create(dto: { full_name: string; specialty: string; city?: string; clinic_id?: string | null }) {
    const { data: authData } = await this.supabase.client.auth.getUser();
    const { data, error } = await this.supabase.client
      .from('doctors')
      .insert({ ...dto, added_by: authData.user?.id })
      .select('*, clinics(name)')
      .single();

    if (error) throw error;
    this.all.update(list => [data as DoctorRow, ...list]);
    return data as DoctorRow;
  }
}
