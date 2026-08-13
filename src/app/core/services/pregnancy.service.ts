import { Injectable, computed, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Pregnancy {
  id: string;
  user_id: string;
  last_period_date: string | null;
  confirmed_date: string | null;
  due_date: string;
  conception_method: 'natural' | 'ivf';
  is_active: boolean;
  created_at: string;
}

const TOTAL_GESTATION_DAYS = 280;

@Injectable({ providedIn: 'root' })
export class PregnancyService {
  readonly active = signal<Pregnancy | null>(null);
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  async load() {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('pregnancies')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    this.active.set(data as Pregnancy | null);
    this.loading.set(false);
  }

  async create(dto: { due_date: string; last_period_date?: string; confirmed_date?: string; conception_method?: 'natural' | 'ivf' }) {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await this.supabase.client
      .from('pregnancies')
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    this.active.set(data as Pregnancy);
    return data as Pregnancy;
  }

  async update(patch: { due_date?: string; last_period_date?: string | null; conception_method?: 'natural' | 'ivf' }) {
    const current = this.active();
    if (!current) throw new Error('No active pregnancy');

    const { data, error } = await this.supabase.client
      .from('pregnancies')
      .update(patch)
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;
    this.active.set(data as Pregnancy);
    return data as Pregnancy;
  }

  readonly gestationDays = computed(() => {
    const p = this.active();
    if (!p) return 0;
    const due = new Date(p.due_date);
    const today = new Date();
    const remainingDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
    return Math.min(Math.max(TOTAL_GESTATION_DAYS - remainingDays, 0), TOTAL_GESTATION_DAYS);
  });

  readonly weekNumber = computed(() => Math.floor(this.gestationDays() / 7));
  readonly weekDay = computed(() => this.gestationDays() % 7);
  readonly totalWeeks = 40;
}
