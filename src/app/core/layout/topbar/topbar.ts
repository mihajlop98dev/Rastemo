import { Component, HostListener, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Search, Bell, MessageCircle, ChevronDown, Stethoscope, MessageSquare, Heart, ChevronRight } from 'lucide-angular';
import { UiAvatar } from '../../../shared/ui/avatar/avatar';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { NotificationService, NotificationRow } from '../../services/notification.service';
import { MessagesService } from '../../services/messages.service';
import { SupabaseService } from '../../services/supabase.service';

interface SearchResult {
  kind: 'doctor' | 'topic';
  id: string;
  label: string;
  sublabel: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiAvatar],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class Topbar implements OnInit {
  @Input() title = '';
  @Input() subtitle = '';

  searchTerm = '';
  readonly searchResults = signal<SearchResult[]>([]);
  readonly searchOpen = signal(false);
  private searchDebounce?: ReturnType<typeof setTimeout>;

  readonly notifOpen = signal(false);

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    readonly auth: AuthService,
    readonly profileSvc: ProfileService,
    readonly notifications: NotificationService,
    readonly messages: MessagesService,
  ) {}

  async ngOnInit() {
    if (!this.profileSvc.profile()) await this.profileSvc.load();
    await Promise.all([this.notifications.load(), this.messages.loadConversations()]);
  }

  get userName(): string {
    return this.profileSvc.profile()?.full_name || this.auth.user()?.email || 'Korisnica';
  }

  onSearchInput() {
    clearTimeout(this.searchDebounce);
    const term = this.searchTerm.trim();
    if (!term) {
      this.searchResults.set([]);
      this.searchOpen.set(false);
      return;
    }
    this.searchDebounce = setTimeout(() => this.runSearch(term), 250);
  }

  private async runSearch(term: string) {
    const [{ data: doctors }, { data: topics }] = await Promise.all([
      this.supabase.client.from('doctors').select('id, full_name, specialty').ilike('full_name', `%${term}%`).limit(5),
      this.supabase.client.from('forum_topics').select('id, title').ilike('title', `%${term}%`).limit(5),
    ]);

    const results: SearchResult[] = [
      ...((doctors ?? []) as any[]).map(d => ({ kind: 'doctor' as const, id: d.id, label: d.full_name, sublabel: d.specialty })),
      ...((topics ?? []) as any[]).map(t => ({ kind: 'topic' as const, id: t.id, label: t.title, sublabel: 'Tema na forumu' })),
    ];

    this.searchResults.set(results);
    this.searchOpen.set(true);
  }

  selectResult(result: SearchResult) {
    this.searchOpen.set(false);
    this.searchTerm = '';
    this.searchResults.set([]);
    if (result.kind === 'doctor') {
      this.router.navigate(['/doctors']);
    } else {
      this.router.navigate(['/community/topic', result.id]);
    }
  }

  toggleNotifications() {
    this.notifOpen.update(v => !v);
  }

  async openNotification(n: NotificationRow) {
    await this.notifications.markRead(n.id);
    if (!n.link) return;
    this.notifOpen.set(false);
    this.router.navigateByUrl(n.link);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.topbar__search')) {
      this.searchOpen.set(false);
    }
    if (!target.closest('.topbar__notif')) {
      this.notifOpen.set(false);
    }
  }

  readonly SearchIcon = Search;
  readonly BellIcon = Bell;
  readonly MessageIcon = MessageCircle;
  readonly ChevronIcon = ChevronDown;
  readonly StrelicaIcon = ChevronRight;
  readonly DoctorIcon = Stethoscope;
  readonly TopicIcon = MessageSquare;
  readonly HeartIcon = Heart;
}
