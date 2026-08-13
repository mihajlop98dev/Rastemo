import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Profile {
  id: string;
  full_name: string | null;
  city: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  role: string;
  default_anonymous: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  readonly profile = signal<Profile | null>(null);
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  async load() {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    this.profile.set(data as Profile | null);
    this.loading.set(false);
  }

  async update(patch: Partial<Omit<Profile, 'id'>>) {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await this.supabase.client
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    this.profile.set(data as Profile);
    return data as Profile;
  }
}
