import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface SymptomEntryRow {
  id: string;
  pregnancy_id: string;
  name: string;
  level: 1 | 2 | 3;
  logged_date: string;
  created_at: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

@Injectable({ providedIn: 'root' })
export class SymptomService {
  readonly today = signal<SymptomEntryRow[]>([]);
  readonly lastWeek = signal<SymptomEntryRow[]>([]);
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService) {}

  async loadToday(pregnancyId: string) {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('symptom_entries')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .eq('logged_date', todayIso());

    this.today.set((data as SymptomEntryRow[]) ?? []);
    this.loading.set(false);
  }

  async loadLastWeek(pregnancyId: string) {
    const { data } = await this.supabase.client
      .from('symptom_entries')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .gte('logged_date', daysAgoIso(6))
      .order('logged_date', { ascending: true });

    this.lastWeek.set((data as SymptomEntryRow[]) ?? []);
  }

  async setLevel(pregnancyId: string, name: string, level: 1 | 2 | 3) {
    const existing = this.today().find(e => e.name === name);

    if (existing) {
      const { data, error } = await this.supabase.client
        .from('symptom_entries')
        .update({ level })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      this.today.update(list => list.map(e => (e.id === existing.id ? (data as SymptomEntryRow) : e)));
      return data as SymptomEntryRow;
    }

    const { data, error } = await this.supabase.client
      .from('symptom_entries')
      .insert({ pregnancy_id: pregnancyId, name, level, logged_date: todayIso() })
      .select()
      .single();
    if (error) throw error;
    this.today.update(list => [...list, data as SymptomEntryRow]);
    return data as SymptomEntryRow;
  }
}
