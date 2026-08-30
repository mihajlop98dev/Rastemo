import { Injectable, computed, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

export interface ConversationRow {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
  user_a: { full_name: string } | null;
  user_b: { full_name: string } | null;
}

export interface ConversationSummary {
  id: string;
  otherUserId: string;
  otherName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  readonly conversations = signal<ConversationSummary[]>([]);
  readonly messages = signal<MessageRow[]>([]);
  readonly loading = signal(false);

  readonly unreadCount = computed(() => this.conversations().reduce((sum, c) => sum + c.unreadCount, 0));

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService,
    private notifications: NotificationService,
  ) {}

  private pair(a: string, b: string): [string, string] {
    return a < b ? [a, b] : [b, a];
  }

  async findOrCreateConversation(otherUserId: string): Promise<string> {
    const me = this.auth.user()?.id;
    if (!me) throw new Error('Not authenticated');

    const [userA, userB] = this.pair(me, otherUserId);

    const { data: existing } = await this.supabase.client
      .from('conversations')
      .select('id')
      .eq('user_a_id', userA)
      .eq('user_b_id', userB)
      .maybeSingle();

    if (existing) return existing.id as string;

    const { data: created, error } = await this.supabase.client
      .from('conversations')
      .insert({ user_a_id: userA, user_b_id: userB })
      .select('id')
      .single();
    if (error) throw error;
    return created.id as string;
  }

  async loadConversations() {
    const me = this.auth.user()?.id;
    if (!me) return;

    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('conversations')
      .select('*, user_a:profiles!conversations_user_a_id_fkey(full_name), user_b:profiles!conversations_user_b_id_fkey(full_name)')
      .or(`user_a_id.eq.${me},user_b_id.eq.${me}`)
      .order('created_at', { ascending: false });

    const rows = (data as ConversationRow[]) ?? [];
    const ids = rows.map(r => r.id);

    let allMessages: MessageRow[] = [];
    if (ids.length) {
      const { data: msgs } = await this.supabase.client
        .from('messages')
        .select('*')
        .in('conversation_id', ids)
        .order('created_at', { ascending: false });
      allMessages = (msgs as MessageRow[]) ?? [];
    }

    const summaries: ConversationSummary[] = rows.map(r => {
      const isUserA = r.user_a_id === me;
      const otherUserId = isUserA ? r.user_b_id : r.user_a_id;
      const otherName = (isUserA ? r.user_b?.full_name : r.user_a?.full_name) || 'Korisnica';
      const convMessages = allMessages.filter(m => m.conversation_id === r.id);
      const last = convMessages[0] ?? null;
      const unreadCount = convMessages.filter(m => m.sender_id !== me && !m.is_read).length;

      return {
        id: r.id,
        otherUserId,
        otherName,
        lastMessage: last?.content ?? null,
        lastMessageAt: last?.created_at ?? r.created_at,
        unreadCount,
      };
    });

    this.conversations.set(summaries);
    this.loading.set(false);
  }

  async loadMessages(conversationId: string) {
    const me = this.auth.user()?.id;

    const { data } = await this.supabase.client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    this.messages.set((data as MessageRow[]) ?? []);

    const unread = this.messages().filter(m => m.sender_id !== me && !m.is_read);
    if (unread.length) {
      await this.supabase.client
        .from('messages')
        .update({ is_read: true })
        .in('id', unread.map(m => m.id));
      this.messages.update(list => list.map(m => (unread.some(u => u.id === m.id) ? { ...m, is_read: true } : m)));
      this.conversations.update(list => list.map(c => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)));
    }
  }

  async send(conversationId: string, otherUserId: string, content: string) {
    const me = this.auth.user()?.id;
    if (!me || !content.trim()) return;

    const { data, error } = await this.supabase.client
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: me, content })
      .select()
      .single();
    if (error) throw error;

    this.messages.update(list => [...list, data as MessageRow]);
    await this.notifications.notify(otherUserId, 'message', 'Nova poruka', content.slice(0, 120), `/messages/${conversationId}`);
  }
}
