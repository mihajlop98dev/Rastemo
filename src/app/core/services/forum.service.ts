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
  author_id: string;
  title: string;
  body: string;
  is_anonymous: boolean;
  is_pinned: boolean;
  reply_count: number;
  created_at: string;
  forum_categories: { name: string } | null;
  profiles: { full_name: string } | null;
}

export interface ForumPostRow {
  id: string;
  topic_id: string;
  author_id: string;
  body: string;
  is_anonymous: boolean;
  created_at: string;
  profiles: { full_name: string } | null;
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
      .from('forum_topics')
      .select('*, forum_categories(name), profiles!forum_topics_author_id_fkey(full_name)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    this.topics.set((data as ForumTopicRow[]) ?? []);
    this.loading.set(false);
  }

  async createTopic(dto: { category_id: string; title: string; body: string; is_anonymous: boolean }) {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await this.supabase.client
      .from('forum_topics')
      .insert({ ...dto, author_id: userId })
      .select('*, forum_categories(name), profiles!forum_topics_author_id_fkey(full_name)')
      .single();

    if (error) throw error;
    this.topics.update(list => [data as ForumTopicRow, ...list]);
    return data as ForumTopicRow;
  }

  categoryCount(categoryId: string): number {
    return this.topics().filter(t => t.category_id === categoryId).length;
  }

  async getTopicById(id: string): Promise<ForumTopicRow | null> {
    const cached = this.topics().find(t => t.id === id);
    if (cached) return cached;

    const { data } = await this.supabase.client
      .from('forum_topics')
      .select('*, forum_categories(name), profiles!forum_topics_author_id_fkey(full_name)')
      .eq('id', id)
      .maybeSingle();
    return data as ForumTopicRow | null;
  }

  async loadPosts(topicId: string) {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('forum_posts')
      .select('*, profiles!forum_posts_author_id_fkey(full_name)')
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
      .select('*, profiles!forum_posts_author_id_fkey(full_name)')
      .single();
    if (error) throw error;

    this.posts.update(list => [...list, data as ForumPostRow]);
    this.topics.update(list => list.map(t => (t.id === topicId ? { ...t, reply_count: t.reply_count + 1 } : t)));

    const topic = await this.getTopicById(topicId);
    if (topic && topic.author_id !== userId) {
      await this.notifications.notify(topic.author_id, 'forum_reply', 'Novi odgovor na tvoju temu', body.slice(0, 120));
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
}
