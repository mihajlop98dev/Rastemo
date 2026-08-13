import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface WeightEntryRow {
  id: string;
  pregnancy_id: string;
  weight_kg: number;
  logged_date: string;
  created_at: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable({ providedIn: 'root' })
export class WeightService {
  readonly entries = signal<WeightEntryRow[]>([]);
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService) {}

  async loadAll(pregnancyId: string) {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('weight_entries')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .order('logged_date', { ascending: true });

    this.entries.set((data as WeightEntryRow[]) ?? []);
    this.loading.set(false);
  }

  get latest(): WeightEntryRow | null {
    const list = this.entries();
    return list.length ? list[list.length - 1] : null;
  }

  async logToday(pregnancyId: string, weightKg: number) {
    const today = todayIso();
    const existing = this.entries().find(e => e.logged_date === today);

    if (existing) {
      const { data, error } = await this.supabase.client
        .from('weight_entries')
        .update({ weight_kg: weightKg })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      this.entries.update(list => list.map(e => (e.id === existing.id ? (data as WeightEntryRow) : e)));
      return data as WeightEntryRow;
    }

    const { data, error } = await this.supabase.client
      .from('weight_entries')
      .insert({ pregnancy_id: pregnancyId, weight_kg: weightKg, logged_date: today })
      .select()
      .single();
    if (error) throw error;
    this.entries.update(list => [...list, data as WeightEntryRow]);
    return data as WeightEntryRow;
  }
}
