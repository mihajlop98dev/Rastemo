import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Search, Plus, MessageCircle, Pin, EyeOff, X, Bookmark } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiAvatar } from '../../shared/ui/avatar/avatar';
import { UiTabs, UiTabItem } from '../../shared/ui/tabs/tabs';
import { AuthService } from '../../core/services/auth.service';
import { ForumService, ForumTopicRow } from '../../core/services/forum.service';
import { Router } from '@angular/router';
import { SeoService } from '../vodic/seo.service';
import { inject } from '@angular/core';
import { TraziKorisnicko } from '../../shared/trazi-korisnicko/trazi-korisnicko';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [TraziKorisnicko, CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiButton, UiBadge, UiAvatar, UiTabs],
  templateUrl: './community.html',
  styleUrl: './community.scss'
})
export class Community implements OnInit {
  readonly tabs: UiTabItem[] = [
    { id: 'forumi', label: 'Forumi' },
    { id: 'pratim', label: 'Pratim' },
    { id: 'moje', label: 'Moje teme' },
  ];
  activeTab = 'forumi';

  private router = inject(Router);
  private seo = inject(SeoService);

  /** Neulogovana vidi sve, ali „Pratim" i „Moje teme" nemaju smisla bez naloga. */
  get vidljiviTabovi(): UiTabItem[] {
    return this.auth.user() ? this.tabs : this.tabs.filter(t => t.id === 'forumi');
  }

  /**
   * Vodi na prijavu i pamti gde se stalo.
   *
   * Bez toga bi se posle prijave završilo na Početnoj, a tema koja se čitala
   * bila bi izgubljena — to je mesto na kom se odustaje.
   */
  naPrijavu() {
    this.router.navigate(['/login'], {
      queryParams: { nazad: this.router.url },
    });
  }

  readonly showCreate = signal(false);
  readonly saving = signal(false);
  newTitle = '';
  newBody = '';
  newCategoryId = '';
  newAnonymous = false;

  // Šablon proverava prijavu, pa auth mora da bude dostupan i njemu.
  constructor(
    readonly auth: AuthService,
    readonly forumSvc: ForumService,
    readonly profileSvc: ProfileService,
  ) {}

  async ngOnInit() {
    this.seo.postavi(
      'Zajednica trudnica — pitanja i iskustva',
      'Pitanja i iskustva trudnica: simptomi, analize, pripreme za porođaj i sve ostalo. Čitanje je otvoreno svima.',
      '/zajednica',
    );

    // „Sačuvane teme" postoje samo za prijavljene; neulogovanoj taj upit
    // vraća grešku i bespotrebno usporava učitavanje.
    const poslovi: Promise<unknown>[] = [
      this.forumSvc.loadCategories(),
      this.forumSvc.loadTopics(),
    ];
    if (this.auth.user()) {
      poslovi.push(this.forumSvc.loadSavedTopicIds());
      if (!this.profileSvc.profile()) poslovi.push(this.profileSvc.load());
    }
    await Promise.all(poslovi);
  }

  get visibleTopics(): ForumTopicRow[] {
    const all = this.forumSvc.topics();
    if (this.activeTab === 'pratim') {
      const saved = this.forumSvc.savedTopicIds();
      return all.filter(t => saved.has(t.id));
    }
    if (this.activeTab === 'moje') {
      return all.filter(t => t.moja);
    }
    return all;
  }

  isSaved(topicId: string): boolean {
    return this.forumSvc.savedTopicIds().has(topicId);
  }

  toggleSaved(event: Event, topicId: string) {
    event.preventDefault();
    event.stopPropagation();
    this.forumSvc.toggleSaved(topicId);
  }

  authorLabel(topic: { is_anonymous: boolean; autor: string | null }): string {
    if (topic.is_anonymous) return 'Anonimna trudnica';
    return topic.autor ?? 'Korisnica';
  }

  timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diffMs / 3_600_000);
    if (hours < 1) return 'upravo sada';
    if (hours < 24) return `pre ${hours}h`;
    const days = Math.floor(hours / 24);
    return `pre ${days}d`;
  }

  readonly traziKorisnicko = signal(false);

  /** Bez korisničkog imena nema čime da se potpiše, pa se prvo traži ono. */
  private nemaKorisnicko(): boolean {
    return !this.profileSvc.profile()?.username;
  }

  async korisnickoPostavljeno() {
    this.traziKorisnicko.set(false);
    await this.profileSvc.load();
    this.openCreate();
  }

  openCreate() {
    if (!this.auth.user()) {
      this.naPrijavu();
      return;
    }
    if (this.nemaKorisnicko()) {
      this.traziKorisnicko.set(true);
      return;
    }
    this.newTitle = '';
    this.newBody = '';
    this.newCategoryId = this.forumSvc.categories()[0]?.id ?? '';
    this.newAnonymous = false;
    this.showCreate.set(true);
  }

  closeCreate() {
    this.showCreate.set(false);
  }

  async submitCreate() {
    if (!this.newTitle || !this.newBody || !this.newCategoryId) return;
    this.saving.set(true);
    try {
      await this.forumSvc.createTopic({
        category_id: this.newCategoryId,
        title: this.newTitle,
        body: this.newBody,
        is_anonymous: this.newAnonymous,
      });
      this.showCreate.set(false);
    } finally {
      this.saving.set(false);
    }
  }

  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly MessageIcon = MessageCircle;
  readonly PinIcon = Pin;
  readonly AnonIcon = EyeOff;
  readonly XIcon = X;
  readonly SaveIcon = Bookmark;
}
