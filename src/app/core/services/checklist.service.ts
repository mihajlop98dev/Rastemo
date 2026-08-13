import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface ChecklistRow {
  id: string;
  pregnancy_id: string;
  type: string;
  title: string;
}

export interface ChecklistItemRow {
  id: string;
  checklist_id: string;
  group_name: string;
  label: string;
  is_done: boolean;
  sort_order: number;
}

@Injectable({ providedIn: 'root' })
export class ChecklistService {
  readonly checklist = signal<ChecklistRow | null>(null);
  readonly items = signal<ChecklistItemRow[]>([]);
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService) {}

  async loadOrCreate(
    pregnancyId: string,
    type: string,
    title: string,
    defaultItems: { group_name: string; label: string }[],
  ) {
    this.loading.set(true);

    const { data: existing } = await this.supabase.client
      .from('checklists')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .eq('type', type)
      .maybeSingle();

    let checklist = existing as ChecklistRow | null;

    if (!checklist) {
      const { data: created, error } = await this.supabase.client
        .from('checklists')
        .insert({ pregnancy_id: pregnancyId, type, title })
        .select()
        .single();
      if (error) throw error;
      checklist = created as ChecklistRow;

      const rows = defaultItems.map((item, i) => ({
        checklist_id: checklist!.id,
        group_name: item.group_name,
        label: item.label,
        sort_order: i,
      }));
      await this.supabase.client.from('checklist_items').insert(rows);
    }

    this.checklist.set(checklist);

    const { data: items } = await this.supabase.client
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', checklist.id)
      .order('sort_order', { ascending: true });

    this.items.set((items as ChecklistItemRow[]) ?? []);
    this.loading.set(false);
  }

  async toggle(item: ChecklistItemRow) {
    const { data, error } = await this.supabase.client
      .from('checklist_items')
      .update({ is_done: !item.is_done })
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    this.items.update(list => list.map(i => (i.id === item.id ? (data as ChecklistItemRow) : i)));
  }

  get groups(): { title: string; items: ChecklistItemRow[] }[] {
    const map = new Map<string, ChecklistItemRow[]>();
    for (const item of this.items()) {
      const arr = map.get(item.group_name) ?? [];
      arr.push(item);
      map.set(item.group_name, arr);
    }
    return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
  }
}
