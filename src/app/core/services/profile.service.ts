import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { TERMS_VERSION } from '../data/legal';

export interface Profile {
  id: string;
  full_name: string | null;
  /** Potpis na forumu; njime se može i prijaviti. */
  username: string | null;
  city: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  role: string;
  default_anonymous: boolean;
  terms_accepted_at: string | null;
  terms_version: string | null;
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

  /** True kad korisnica još nije prihvatila aktuelnu verziju uslova. */
  needsTermsAcceptance(): boolean {
    const p = this.profile();
    if (!p) return false;
    return !p.terms_accepted_at || p.terms_version !== TERMS_VERSION;
  }

  /**
   * Upisuje trenutak prihvatanja uslova. Zove se i posle registracije i iz
   * modala za postojeće naloge, pa je namerno idempotentan.
   */
  async acceptTerms() {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Not authenticated');

    const patch = {
      terms_accepted_at: new Date().toISOString(),
      terms_version: TERMS_VERSION,
    };

    const { data, error } = await this.supabase.client
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (data) this.profile.set(data as Profile);
  }
}
