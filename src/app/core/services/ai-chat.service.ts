import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { isRedFlag, RED_FLAG_ANSWER } from '../data/red-flags';

export interface AiSource {
  source: string;
  url: string | null;
  section: string | null;
}

export interface AiMessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'ai';
  content: string;
  created_at: string;
  used_sources: AiSource[] | null;
  was_red_flag: boolean;
}

const WELCOME_TEXT =
  'Ćao! 👋 Prepričavam ti ono što piše u zvaničnim izvorima o trudnoći — ispod svakog ' +
  'odgovora vidiš iz kog izvora dolazi.\n\n' +
  'Ne poznajem tvoju trudnoću, ne postavljam dijagnoze i ne preporučujem lekove. ' +
  'Sve što ti kažem proveri sa svojim ginekologom. Ako opišeš nešto hitno, uputiću te ' +
  'pravo na hitnu pomoć.';

@Injectable({ providedIn: 'root' })
export class AiChatService {
  readonly conversationId = signal<string | null>(null);
  readonly messages = signal<AiMessageRow[]>([]);
  readonly loading = signal(false);
  readonly sending = signal(false);
  readonly error = signal('');

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

  private async insertMessage(
    conversationId: string,
    role: 'user' | 'ai',
    content: string,
    extra: { used_sources?: AiSource[] | null; was_red_flag?: boolean } = {},
  ) {
    const { data, error } = await this.supabase.client
      .from('ai_messages')
      .insert({ conversation_id: conversationId, role, content, ...extra })
      .select()
      .single();
    if (error) throw error;
    return data as AiMessageRow;
  }

  async send(text: string) {
    const convId = this.conversationId();
    if (!convId || !text.trim()) return;

    this.sending.set(true);
    this.error.set('');

    try {
      const userMsg = await this.insertMessage(convId, 'user', text);
      this.messages.update(list => [...list, userMsg]);

      // Hitno se prepoznaje i ovde, da odgovor stigne odmah bez čekanja mreže.
      // Serverska provera svejedno postoji, jer se aplikacija može zaobići.
      if (isRedFlag(text)) {
        const msg = await this.insertMessage(convId, 'ai', RED_FLAG_ANSWER, { was_red_flag: true });
        this.messages.update(list => [...list, msg]);
        return;
      }

      const { data, error } = await this.supabase.client.functions.invoke('ai-asistent', {
        body: { question: text },
      });

      if (error || !data?.answer) {
        this.error.set(
          'Asistent trenutno nije dostupan. Pitanje možeš da postaviš u Zajednici ili svom lekaru.',
        );
        return;
      }

      const aiMsg = await this.insertMessage(convId, 'ai', data.answer, {
        used_sources: data.sources ?? null,
        was_red_flag: !!data.redFlag,
      });
      this.messages.update(list => [...list, aiMsg]);
    } finally {
      this.sending.set(false);
    }
  }
}
