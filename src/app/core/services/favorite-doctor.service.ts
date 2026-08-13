import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FavoriteDoctorService {
  readonly ids = signal<Set<string>>(new Set());
  readonly loading = signal(false);

  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  async load() {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('favorite_doctors')
      .select('doctor_id')
      .eq('user_id', userId);

    this.ids.set(new Set((data ?? []).map((r: any) => r.doctor_id as string)));
    this.loading.set(false);
  }

  isFavorite(doctorId: string): boolean {
    return this.ids().has(doctorId);
  }

  async toggle(doctorId: string) {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    if (this.isFavorite(doctorId)) {
      await this.supabase.client
        .from('favorite_doctors')
        .delete()
        .eq('user_id', userId)
        .eq('doctor_id', doctorId);
      this.ids.update(set => {
        const next = new Set(set);
        next.delete(doctorId);
        return next;
      });
    } else {
      await this.supabase.client.from('favorite_doctors').insert({ user_id: userId, doctor_id: doctorId });
      this.ids.update(set => new Set(set).add(doctorId));
    }
  }
}
