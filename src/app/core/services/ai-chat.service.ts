import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface AiMessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'ai';
  content: string;
  created_at: string;
}

const WELCOME_TEXT = 'Ćao! 👋 Kako mogu da ti pomognem danas? Slobodno pitaj bilo šta o trudnoći, simptomima ili pripremama.';

@Injectable({ providedIn: 'root' })
export class AiChatService {
  readonly conversationId = signal<string | null>(null);
  readonly messages = signal<AiMessageRow[]>([]);
  readonly loading = signal(false);
  readonly sending = signal(false);

  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  async init() {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    this.loading.set(true);

    const { data: existing } = await this.supabase.client
      .from('ai_conversations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let convId = existing?.id as string | undefined;

    if (!convId) {
      const { data: created, error } = await this.supabase.client
        .from('ai_conversations')
        .insert({ user_id: userId, title: 'Razgovor' })
        .select('id')
        .single();
      if (error) throw error;
      convId = created.id;
    }

    this.conversationId.set(convId!);

    const { data: msgs } = await this.supabase.client
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (!msgs || msgs.length === 0) {
      const welcome = await this.insertMessage(convId!, 'ai', WELCOME_TEXT);
      this.messages.set([welcome]);
    } else {
      this.messages.set(msgs as AiMessageRow[]);
    }

    this.loading.set(false);
  }

  private async insertMessage(conversationId: string, role: 'user' | 'ai', content: string) {
    const { data, error } = await this.supabase.client
      .from('ai_messages')
      .insert({ conversation_id: conversationId, role, content })
      .select()
      .single();
    if (error) throw error;
    return data as AiMessageRow;
  }

  async send(text: string) {
    const convId = this.conversationId();
    if (!convId || !text.trim()) return;

    this.sending.set(true);
    try {
      const userMsg = await this.insertMessage(convId, 'user', text);
      this.messages.update(list => [...list, userMsg]);

      const reply = 'Hvala na pitanju! Ovo je demo odgovor — ovde bi stigao personalizovani AI odgovor zasnovan na tvojoj trudnoći. Za konkretne medicinske nedoumice uvek se obrati svom lekaru.';
      const aiMsg = await this.insertMessage(convId, 'ai', reply);
      this.messages.update(list => [...list, aiMsg]);
    } finally {
      this.sending.set(false);
    }
  }
}
