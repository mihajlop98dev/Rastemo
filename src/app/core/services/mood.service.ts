import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface MoodEntryRow {
  id: string;
  pregnancy_id: string;
  mood: 1 | 2 | 3 | 4 | 5;
  note: string | null;
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
export class MoodService {
  readonly today = signal<MoodEntryRow | null>(null);
  readonly lastWeek = signal<MoodEntryRow[]>([]);
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService) {}

  async loadToday(pregnancyId: string) {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('mood_entries')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .eq('logged_date', todayIso())
      .maybeSingle();

    this.today.set(data as MoodEntryRow | null);
    this.loading.set(false);
  }

  async loadLastWeek(pregnancyId: string) {
    const { data } = await this.supabase.client
      .from('mood_entries')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .gte('logged_date', daysAgoIso(6))
      .order('logged_date', { ascending: true });

    this.lastWeek.set((data as MoodEntryRow[]) ?? []);
  }

  async setMood(pregnancyId: string, mood: 1 | 2 | 3 | 4 | 5, note?: string) {
    const existing = this.today();

    if (existing) {
      const { data, error } = await this.supabase.client
        .from('mood_entries')
        .update({ mood, note: note ?? existing.note })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      this.today.set(data as MoodEntryRow);
      return data as MoodEntryRow;
    }

    const { data, error } = await this.supabase.client
      .from('mood_entries')
      .insert({ pregnancy_id: pregnancyId, mood, note, logged_date: todayIso() })
      .select()
      .single();
    if (error) throw error;
    this.today.set(data as MoodEntryRow);
    return data as MoodEntryRow;
  }
}
