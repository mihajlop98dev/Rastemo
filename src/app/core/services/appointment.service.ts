import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface AppointmentRow {
  id: string;
  pregnancy_id: string;
  title: string;
  subtitle: string | null;
  appointment_type: 'pregled' | 'analize' | 'ultrazvuk' | 'ostalo';
  doctor_id: string | null;
  clinic_id: string | null;
  scheduled_at: string;
  notes: string | null;
  created_at: string;
  clinics: { name: string } | null;
  doctors: { full_name: string } | null;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  readonly all = signal<AppointmentRow[]>([]);
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService) {}

  async loadAll(pregnancyId: string) {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('appointments')
      .select('*, clinics(name), doctors(full_name)')
      .eq('pregnancy_id', pregnancyId)
      .order('scheduled_at', { ascending: true });

    this.all.set((data as AppointmentRow[]) ?? []);
    this.loading.set(false);
  }

  get upcoming(): AppointmentRow[] {
    const now = Date.now();
    return this.all().filter(a => new Date(a.scheduled_at).getTime() >= now);
  }

  async create(dto: {
    pregnancy_id: string;
    title: string;
    subtitle?: string;
    appointment_type?: AppointmentRow['appointment_type'];
    scheduled_at: string;
    notes?: string;
  }) {
    const { data, error } = await this.supabase.client
      .from('appointments')
      .insert(dto)
      .select('*, clinics(name), doctors(full_name)')
      .single();

    if (error) throw error;
    this.all.update(list => [...list, data as AppointmentRow].sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    ));
    return data as AppointmentRow;
  }

  async getById(id: string): Promise<AppointmentRow | null> {
    const cached = this.all().find(a => a.id === id);
    if (cached) return cached;

    const { data } = await this.supabase.client
      .from('appointments')
      .select('*, clinics(name), doctors(full_name)')
      .eq('id', id)
      .maybeSingle();
    return data as AppointmentRow | null;
  }
}
