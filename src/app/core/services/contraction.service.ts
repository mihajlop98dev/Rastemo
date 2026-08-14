import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface ContractionRow {
  id: string;
  pregnancy_id: string;
  started_at: string;
  duration_seconds: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ContractionService {
  readonly entries = signal<ContractionRow[]>([]);
  readonly loading = signal(false);

  readonly timing = signal(false);
  readonly timerStartedAt = signal<number | null>(null);

  constructor(private supabase: SupabaseService) {}

  async loadAll(pregnancyId: string) {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('contractions')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .order('started_at', { ascending: false })
      .limit(50);

    this.entries.set((data as ContractionRow[]) ?? []);
    this.loading.set(false);
  }

  startTimer() {
    this.timerStartedAt.set(Date.now());
    this.timing.set(true);
  }

  async stopTimer(pregnancyId: string) {
    const startedAt = this.timerStartedAt();
    if (!startedAt) return;

    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    this.timing.set(false);
    this.timerStartedAt.set(null);

    const { data, error } = await this.supabase.client
      .from('contractions')
      .insert({
        pregnancy_id: pregnancyId,
        started_at: new Date(startedAt).toISOString(),
        duration_seconds: durationSeconds,
      })
      .select()
      .single();

    if (error) throw error;
    this.entries.update(list => [data as ContractionRow, ...list]);
    return data as ContractionRow;
  }

  cancelTimer() {
    this.timing.set(false);
    this.timerStartedAt.set(null);
  }

  async remove(id: string) {
    await this.supabase.client.from('contractions').delete().eq('id', id);
    this.entries.update(list => list.filter(e => e.id !== id));
  }

  /** Seconds between the start of this contraction and the start of the previous one (list is newest-first). */
  intervalSecondsFor(index: number): number | null {
    const list = this.entries();
    const current = list[index];
    const prev = list[index + 1];
    if (!current || !prev) return null;
    return Math.round((new Date(current.started_at).getTime() - new Date(prev.started_at).getTime()) / 1000);
  }
}
