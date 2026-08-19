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

export interface CustomSymptomRow {
  id: string;
  pregnancy_id: string;
  name: string;
  emoji: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class SymptomService {
  readonly today = signal<SymptomEntryRow[]>([]);
  readonly lastWeek = signal<SymptomEntryRow[]>([]);
  readonly custom = signal<CustomSymptomRow[]>([]);
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService) {}

  async loadCustom(pregnancyId: string) {
    const { data } = await this.supabase.client
      .from('custom_symptoms')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .order('created_at', { ascending: true });

    this.custom.set((data as CustomSymptomRow[]) ?? []);
  }

  async addCustom(pregnancyId: string, name: string, emoji: string) {
    const { data, error } = await this.supabase.client
      .from('custom_symptoms')
      .insert({ pregnancy_id: pregnancyId, name, emoji })
      .select()
      .single();

    if (error) throw error;
    this.custom.update(list => [...list, data as CustomSymptomRow]);
    return data as CustomSymptomRow;
  }

  /**
   * Briše samo definiciju simptoma; već upisani unosi ostaju u istoriji da
   * trend za prošle dane ne bi promenio oblik unazad.
   */
  async removeCustom(id: string) {
    const { error } = await this.supabase.client.from('custom_symptoms').delete().eq('id', id);
    if (error) throw error;
    this.custom.update(list => list.filter(s => s.id !== id));
  }

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

  /** Poništava današnji unos — klik na već izabran nivo znači "ipak ne". */
  async clearLevel(name: string) {
    const existing = this.today().find(e => e.name === name);
    if (!existing) return;

    const { error } = await this.supabase.client
      .from('symptom_entries')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;

    this.today.update(list => list.filter(e => e.id !== existing.id));
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
