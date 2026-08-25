import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface DiaryEntryRow {
  id: string;
  pregnancy_id: string;
  entry_type: 'note' | 'photo' | 'memory' | 'exam_note' | 'doctor_question';
  title: string | null;
  content: string | null;
  photo_url: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class DiaryService {
  readonly entries = signal<DiaryEntryRow[]>([]);
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService) {}

  async loadAll(pregnancyId: string) {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('diary_entries')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      // Pitanja za lekara dele istu tabelu, ali imaju svoj ekran i ne spadaju
      // u beleške — bez ovog filtera pojavila bi se u dnevniku.
      .neq('entry_type', 'doctor_question')
      .order('created_at', { ascending: false });

    this.entries.set((data as DiaryEntryRow[]) ?? []);
    this.loading.set(false);
  }

  async create(pregnancyId: string, title: string, content: string) {
    const { data, error } = await this.supabase.client
      .from('diary_entries')
      .insert({ pregnancy_id: pregnancyId, entry_type: 'note', title, content })
      .select()
      .single();
    if (error) throw error;
    this.entries.update(list => [data as DiaryEntryRow, ...list]);
    return data as DiaryEntryRow;
  }

  async remove(id: string) {
    const { error } = await this.supabase.client.from('diary_entries').delete().eq('id', id);
    if (error) throw error;
    this.entries.update(list => list.filter(e => e.id !== id));
  }
}
