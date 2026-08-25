import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface PitanjeRow {
  id: string;
  pregnancy_id: string;
  content: string;
  is_done: boolean;
  created_at: string;
}

/**
 * Pitanja koja žena zapiše između pregleda, da ih ne zaboravi u ordinaciji.
 *
 * Čuvaju se u `diary_entries` pod tipom `doctor_question`, koji je u šemi
 * predviđen od početka. Zato nova tabela nije pravljena — i zato je važno da
 * beleške filtriraju po tipu, da im se pitanja ne pomešaju u spisak.
 */
@Injectable({ providedIn: 'root' })
export class PitanjaLekarService {
  readonly pitanja = signal<PitanjeRow[]>([]);
  readonly ucitavanje = signal(false);

  constructor(private supabase: SupabaseService) {}

  async loadAll(pregnancyId: string) {
    this.ucitavanje.set(true);
    const { data } = await this.supabase.client
      .from('diary_entries')
      .select('id, pregnancy_id, content, is_done, created_at')
      .eq('pregnancy_id', pregnancyId)
      .eq('entry_type', 'doctor_question')
      .order('created_at', { ascending: true });

    this.pitanja.set((data as PitanjeRow[]) ?? []);
    this.ucitavanje.set(false);
  }

  async dodaj(pregnancyId: string, tekst: string) {
    const { data, error } = await this.supabase.client
      .from('diary_entries')
      .insert({ pregnancy_id: pregnancyId, entry_type: 'doctor_question', content: tekst })
      .select('id, pregnancy_id, content, is_done, created_at')
      .single();
    if (error) throw error;
    this.pitanja.update(l => [...l, data as PitanjeRow]);
  }

  async prebaciStanje(id: string) {
    const trenutno = this.pitanja().find(p => p.id === id);
    if (!trenutno) return;
    const novo = !trenutno.is_done;

    // Prikaz se menja odmah; na grešku se vraća, da ekran ne laže o stanju.
    this.pitanja.update(l => l.map(p => (p.id === id ? { ...p, is_done: novo } : p)));
    const { error } = await this.supabase.client
      .from('diary_entries')
      .update({ is_done: novo })
      .eq('id', id);
    if (error) {
      this.pitanja.update(l => l.map(p => (p.id === id ? { ...p, is_done: !novo } : p)));
      throw error;
    }
  }

  async izmeni(id: string, tekst: string) {
    const { error } = await this.supabase.client
      .from('diary_entries')
      .update({ content: tekst })
      .eq('id', id);
    if (error) throw error;
    this.pitanja.update(l => l.map(p => (p.id === id ? { ...p, content: tekst } : p)));
  }

  async obrisi(id: string) {
    await this.supabase.client.from('diary_entries').delete().eq('id', id);
    this.pitanja.update(l => l.filter(p => p.id !== id));
  }
}
