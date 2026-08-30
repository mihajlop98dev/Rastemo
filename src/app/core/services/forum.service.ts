import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

export interface ForumCategoryRow {
  id: string;
  group_name: string;
  name: string;
  slug: string;
}

export interface ForumTopicRow {
  id: string;
  category_id: string;
  /** Prazno kod anonimnih tema — baza ga tada uopšte ne izdaje. */
  author_id: string | null;
  title: string;
  body: string;
  is_anonymous: boolean;
  is_pinned: boolean;
  reply_count: number;
  created_at: string;
  /** Ime autora, ili prazno ako je tema anonimna. */
  autor: string | null;
  /** Popunjeno kad je autor uklonio tekst, a red ostao zbog odgovora. */
  uklonjeno_u: string | null;
  /** Da li je temu napisala prijavljena korisnica. */
  moja: boolean;
  forum_categories: { name: string } | null;
}

export interface ForumPostRow {
  id: string;
  topic_id: string;
  author_id: string | null;
  body: string;
  is_anonymous: boolean;
  created_at: string;
  autor: string | null;
  moj: boolean;
  /** Popunjeno kad je autor uklonio tekst. */
  uklonjeno_u: string | null;
}

@Injectable({ providedIn: 'root' })
export class ForumService {
  readonly categories = signal<ForumCategoryRow[]>([]);
  readonly topics = signal<ForumTopicRow[]>([]);
  readonly posts = signal<ForumPostRow[]>([]);
  readonly savedTopicIds = signal<Set<string>>(new Set());
  readonly loading = signal(false);

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService,
    private notifications: NotificationService,
  ) {}

  async loadCategories() {
    const { data } = await this.supabase.client
      .from('forum_categories')
      .select('*')
      .order('group_name', { ascending: true });
    this.categories.set((data as ForumCategoryRow[]) ?? []);
  }

  async loadTopics() {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('forum_teme_v')
      .select('*, forum_categories(name)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    this.topics.set((data as ForumTopicRow[]) ?? []);
    this.loading.set(false);
  }

  async createTopic(dto: { category_id: string; title: string; body: string; is_anonymous: boolean }) {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Not authenticated');

    // Upis ide u tabelu, a čitanje nazad kroz pogled: tabela više ne izdaje
    // author_id, pa se novi red ne može pročitati direktno iz nje.
    const { data, error } = await this.supabase.client
      .from('forum_topics')
      .insert({ ...dto, author_id: userId })
      .select('id')
      .single();
    if (error) throw error;

    const nova = await this.getTopicById((data as { id: string }).id);
    if (nova) this.topics.update(list => [nova, ...list]);
    return nova as ForumTopicRow;
  }

  categoryCount(categoryId: string): number {
    return this.topics().filter(t => t.category_id === categoryId).length;
  }

  async getTopicById(id: string): Promise<ForumTopicRow | null> {
    const cached = this.topics().find(t => t.id === id);
    if (cached) return cached;

    const { data } = await this.supabase.client
      .from('forum_teme_v')
      .select('*, forum_categories(name)')
      .eq('id', id)
      .maybeSingle();
    return data as ForumTopicRow | null;
  }

  async loadPosts(topicId: string) {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('forum_odgovori_v')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
    this.posts.set((data as ForumPostRow[]) ?? []);
    this.loading.set(false);
  }

  async createPost(topicId: string, body: string, isAnonymous: boolean) {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await this.supabase.client
      .from('forum_posts')
      .insert({ topic_id: topicId, author_id: userId, body, is_anonymous: isAnonymous })
      .select('id')
      .single();
    if (error) throw error;

    await this.loadPosts(topicId);
    this.topics.update(list => list.map(t => (t.id === topicId ? { ...t, reply_count: t.reply_count + 1 } : t)));

    // Obaveštenje šalje baza: kod anonimne teme aplikacija ne zna ko je autor,
    // i ne sme da zna.
    await this.supabase.client.rpc('obavesti_autora_teme', {
      p_topic_id: topicId,
      p_naslov: 'Novi odgovor na tvoju temu',
      p_telo: body.slice(0, 120),
    });

    // Push ide odmah, jer odgovor na forumu vredi dok je razgovor živ.
    // Ko je autor teme utvrđuje funkcija, ne aplikacija — tema može biti
    // anonimna. Neuspeh se ćuti: odgovor je upisan i notifikacija u
    // aplikaciji postoji, pa push koji nije otišao ne sme da sruši slanje.
    try {
      await this.supabase.client.functions.invoke('posalji-push-odgovor', {
        body: { topic_id: topicId },
      });
    } catch {
      // namerno prazno
    }

    return data as ForumPostRow;
  }

  async loadSavedTopicIds() {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    const { data } = await this.supabase.client
      .from('saved_topics')
      .select('topic_id')
      .eq('user_id', userId);
    this.savedTopicIds.set(new Set((data ?? []).map((r: any) => r.topic_id as string)));
  }

  async toggleSaved(topicId: string) {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    if (this.savedTopicIds().has(topicId)) {
      await this.supabase.client.from('saved_topics').delete().eq('user_id', userId).eq('topic_id', topicId);
      this.savedTopicIds.update(set => {
        const next = new Set(set);
        next.delete(topicId);
        return next;
      });
    } else {
      await this.supabase.client.from('saved_topics').insert({ user_id: userId, topic_id: topicId });
      this.savedTopicIds.update(set => new Set(set).add(topicId));
    }
  }

  /**
   * Uklanja svoj odgovor.
   *
   * Odgovor se briše u celosti — ništa ne visi o njemu, za razliku od teme.
   */
  async obrisiSvojOdgovor(id: string) {
    const { error } = await this.supabase.client
      .from('forum_posts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    this.posts.update(l => l.filter(p => p.id !== id));
  }

  /**
   * Uklanja svoju temu.
   *
   * Posao radi funkcija u bazi: temu bez odgovora briše, a temu sa odgovorima
   * samo prazni — brisanje bi povuklo i tuđe odgovore, koji nisu njeni da ih
   * uklanja.
   */
  async ukloniSvojuTemu(id: string) {
    const { error } = await this.supabase.client.rpc('ukloni_svoju_temu', { p_id: id });
    if (error) throw error;
    this.topics.update(l => l.filter(t => t.id !== id));
  }
}
