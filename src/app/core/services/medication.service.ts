import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface MedicationRow {
  id: string;
  pregnancy_id: string;
  name: string;
  type: 'terapija' | 'suplement';
  dose_per_day: number;
  active: boolean;
  created_at: string;
}

export interface MedicationLogRow {
  id: string;
  medication_id: string;
  taken_at: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable({ providedIn: 'root' })
export class MedicationService {
  readonly medications = signal<MedicationRow[]>([]);
  readonly todayLogs = signal<MedicationLogRow[]>([]);
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService) {}

  async loadAll(pregnancyId: string) {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('medications')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .eq('active', true)
      .order('created_at', { ascending: true });

    const meds = (data as MedicationRow[]) ?? [];
    this.medications.set(meds);

    if (meds.length) {
      const start = `${todayIso()}T00:00:00.000Z`;
      const { data: logs } = await this.supabase.client
        .from('medication_logs')
        .select('*')
        .in('medication_id', meds.map(m => m.id))
        .gte('taken_at', start);
      this.todayLogs.set((logs as MedicationLogRow[]) ?? []);
    } else {
      this.todayLogs.set([]);
    }

    this.loading.set(false);
  }

  async add(pregnancyId: string, name: string, type: 'terapija' | 'suplement', dosePerDay: number) {
    const { data, error } = await this.supabase.client
      .from('medications')
      .insert({ pregnancy_id: pregnancyId, name, type, dose_per_day: dosePerDay })
      .select()
      .single();
    if (error) throw error;
    this.medications.update(list => [...list, data as MedicationRow]);
    return data as MedicationRow;
  }

  async remove(id: string) {
    await this.supabase.client.from('medications').update({ active: false }).eq('id', id);
    this.medications.update(list => list.filter(m => m.id !== id));
    this.todayLogs.update(list => list.filter(l => l.medication_id !== id));
  }

  takenCountToday(medicationId: string): number {
    return this.todayLogs().filter(l => l.medication_id === medicationId).length;
  }

  async logDose(medicationId: string) {
    const { data, error } = await this.supabase.client
      .from('medication_logs')
      .insert({ medication_id: medicationId })
      .select()
      .single();
    if (error) throw error;
    this.todayLogs.update(list => [...list, data as MedicationLogRow]);
  }

  async undoDose(medicationId: string) {
    const logs = this.todayLogs().filter(l => l.medication_id === medicationId);
    const last = logs[logs.length - 1];
    if (!last) return;
    await this.supabase.client.from('medication_logs').delete().eq('id', last.id);
    this.todayLogs.update(list => list.filter(l => l.id !== last.id));
  }
}
