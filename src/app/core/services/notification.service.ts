import { Injectable, computed, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  /** Putanja u aplikaciji na koju klik vodi; prazno za starije notifikacije. */
  link: string | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly items = signal<NotificationRow[]>([]);
  readonly loading = signal(false);

  readonly unreadCount = computed(() => this.items().filter(n => !n.is_read).length);

  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  async load() {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    this.items.set((data as NotificationRow[]) ?? []);
    this.loading.set(false);
  }

  async markRead(id: string) {
    await this.supabase.client.from('notifications').update({ is_read: true }).eq('id', id);
    this.items.update(list => list.map(n => (n.id === id ? { ...n, is_read: true } : n)));
  }

  async markAllRead() {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    await this.supabase.client.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    this.items.update(list => list.map(n => ({ ...n, is_read: true })));
  }

  /** Insert a notification for another user (e.g. a forum reply or a new DM). RLS allows any authenticated user to notify. */
  async notify(userId: string, type: string, title: string, body?: string, link?: string) {
    await this.supabase.client.from('notifications').insert({ user_id: userId, type, title, body, link });
  }
}
