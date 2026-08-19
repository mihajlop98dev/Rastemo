import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface AdminUserRow {
  id: string;
  full_name: string | null;
  city: string | null;
  role: string;
  created_at: string;
  terms_accepted_at: string | null;
  /** Broj obrisanih sadržaja — tri znače da nalog ide na brisanje. */
  strikes: number;
}

export interface AdminContentRow {
  id: string;
  kind: 'topic' | 'post';
  title: string | null;
  body: string;
  author_id: string;
  author_name: string;
  is_anonymous: boolean;
  created_at: string;
  /** Za komentar: naslov teme na koju se odnosi. */
  context: string | null;
}

export interface AdminReportRow {
  id: string;
  reporter_id: string;
  target_type: 'topic' | 'post' | 'review' | 'doctor';
  target_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  created_at: string;
}

export interface ModerationActionRow {
  id: string;
  admin_id: string | null;
  target_user_id: string;
  target_type: string;
  target_excerpt: string;
  target_context: string | null;
  reason: string;
  created_at: string;
}

export interface AdminStats {
  users: number;
  pregnancies: number;
  topics: number;
  posts: number;
  doctors: number;
  unverifiedDoctors: number;
  pendingReports: number;
  newUsers7d: number;
}

/** Posle ovoliko obrisanih sadržaja panel označava nalog za brisanje. */
export const STRIKE_LIMIT = 3;

@Injectable({ providedIn: 'root' })
export class AdminService {
  readonly isAdmin = signal(false);
  readonly loading = signal(false);

  readonly stats = signal<AdminStats | null>(null);
  readonly users = signal<AdminUserRow[]>([]);
  readonly content = signal<AdminContentRow[]>([]);
  readonly reports = signal<AdminReportRow[]>([]);
  readonly actions = signal<ModerationActionRow[]>([]);

  constructor(private supabase: SupabaseService, private auth: AuthService) {}

  /**
   * Uloga se čita iz baze, a ne iz signala u aplikaciji — ekran se sme otvoriti
   * samo ako i RLS politike priznaju istu ulogu, inače bi panel izgledao
   * dostupno a svaki upit vraćao prazno.
   */
  async checkAdmin(): Promise<boolean> {
    const userId = this.auth.user()?.id;
    if (!userId) {
      this.isAdmin.set(false);
      return false;
    }

    const { data } = await this.supabase.client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    const ok = data?.role === 'admin' || data?.role === 'moderator';
    this.isAdmin.set(ok);
    return ok;
  }

  /**
   * Brojke dolaze iz baze kao jedan zbir, a ne kao count po tabeli: RLS pušta
   * adminu samo sopstvenu trudnoću, pa je direktno brojanje pokazivalo 1
   * umesto stvarnog broja. Funkcija vraća isključivo zbirove — nijedan red
   * sa zdravstvenim podacima ne izlazi iz baze.
   */
  async loadStats() {
    const { data, error } = await this.supabase.client.rpc('admin_stats');
    if (error) throw error;
    this.stats.set(data as AdminStats);
  }

  async loadUsers() {
    const { data } = await this.supabase.client
      .from('profiles')
      .select('id, full_name, city, role, created_at, terms_accepted_at')
      .order('created_at', { ascending: false });

    const { data: strikes } = await this.supabase.client
      .from('moderation_actions')
      .select('target_user_id');

    const byUser = new Map<string, number>();
    for (const row of (strikes as { target_user_id: string }[]) ?? []) {
      byUser.set(row.target_user_id, (byUser.get(row.target_user_id) ?? 0) + 1);
    }

    this.users.set(
      ((data as Omit<AdminUserRow, 'strikes'>[]) ?? []).map(u => ({
        ...u,
        strikes: byUser.get(u.id) ?? 0,
      })),
    );
  }

  /**
   * Sadržaj se čita kroz funkciju, a ne direktno iz tabela: pravo čitanja
   * kolone sa autorom je oduzeto svima da anonimnost ne bi bila probojna.
   * Funkcija sama proverava da je pozivalac administrator.
   */
  async loadContent() {
    const { data, error } = await this.supabase.client.rpc('admin_sadrzaj');
    if (error) { this.content.set([]); return; }

    const rows = ((data as any[]) ?? []).map(r => ({
      id: r.id,
      kind: r.kind as 'topic' | 'post',
      title: r.title,
      body: r.body,
      author_id: r.author_id,
      author_name: r.author_name,
      is_anonymous: r.is_anonymous,
      created_at: r.created_at,
      context: r.context,
    })) as AdminContentRow[];

    this.content.set(rows);
  }

  async loadReports() {
    const { data } = await this.supabase.client
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    this.reports.set((data as AdminReportRow[]) ?? []);
  }

  async loadActions() {
    const { data } = await this.supabase.client
      .from('moderation_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    this.actions.set((data as ModerationActionRow[]) ?? []);
  }

  strikesFor(userId: string): number {
    return this.users().find(u => u.id === userId)?.strikes ?? 0;
  }

  /**
   * Briše sadržaj, upisuje ga u dnevnik moderacije i obaveštava autora u
   * aplikaciji. Redosled je namerno takav da se dnevnik i obaveštenje upišu
   * pre brisanja — ako brisanje padne, ostaje trag da je pokušano, dok
   * obrnuto bi sadržaj nestao bez ikakvog objašnjenja autoru.
   */
  async removeContent(item: AdminContentRow, reason: string) {
    const c = this.supabase.client;
    const adminId = this.auth.user()?.id ?? null;
    const table = item.kind === 'topic' ? 'forum_topics' : 'forum_posts';

    const excerpt = (item.title ? `${item.title} — ` : '') + item.body;
    const context = item.kind === 'post' ? item.context : 'Tema u Zajednici';

    await c.from('moderation_actions').insert({
      admin_id: adminId,
      target_user_id: item.author_id,
      target_type: item.kind,
      target_id: item.id,
      target_excerpt: excerpt.slice(0, 2000),
      target_context: context,
      reason,
    });

    const strikeNo = this.strikesFor(item.author_id) + 1;
    await c.from('notifications').insert({
      user_id: item.author_id,
      type: 'moderacija',
      title: item.kind === 'topic' ? 'Tvoja tema je uklonjena' : 'Tvoj komentar je uklonjen',
      body:
        `${item.kind === 'topic' ? 'Tema' : 'Komentar'}` +
        (context ? ` (${context})` : '') +
        ` je uklonjen jer krši pravila Zajednice. Razlog: ${reason}. ` +
        `Ovo je ${strikeNo}. opomena od ${STRIKE_LIMIT}. ` +
        `Ako se ponovi, nalog može biti trajno obrisan.`,
    });

    const { error } = await c.from(table).delete().eq('id', item.id);
    if (error) throw error;

    await Promise.all([this.loadContent(), this.loadUsers(), this.loadActions()]);
  }

  async setReportStatus(id: string, status: AdminReportRow['status']) {
    await this.supabase.client.from('reports').update({ status }).eq('id', id);
    await this.loadReports();
  }

  async setDoctorVerified(doctorId: string, verified: boolean) {
    await this.supabase.client.from('doctors').update({ is_verified: verified }).eq('id', doctorId);
  }

  async deleteDoctor(doctorId: string) {
    await this.supabase.client.from('doctors').delete().eq('id', doctorId);
  }

  /** Briše i red u auth.users; provera uloge je unutar same funkcije u bazi. */
  async deleteUser(userId: string) {
    const { error } = await this.supabase.client.rpc('admin_delete_user', { p_user_id: userId });
    if (error) throw error;
    await Promise.all([this.loadUsers(), this.loadStats()]);
  }
}
