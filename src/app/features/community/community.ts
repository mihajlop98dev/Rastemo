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

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiButton, UiBadge, UiAvatar, UiTabs],
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

  readonly showCreate = signal(false);
  readonly saving = signal(false);
  newTitle = '';
  newBody = '';
  newCategoryId = '';
  newAnonymous = false;

  constructor(private auth: AuthService, readonly forumSvc: ForumService) {}

  async ngOnInit() {
    await Promise.all([this.forumSvc.loadCategories(), this.forumSvc.loadTopics(), this.forumSvc.loadSavedTopicIds()]);
  }

  get visibleTopics(): ForumTopicRow[] {
    const all = this.forumSvc.topics();
    if (this.activeTab === 'pratim') {
      const saved = this.forumSvc.savedTopicIds();
      return all.filter(t => saved.has(t.id));
    }
    if (this.activeTab === 'moje') {
      const me = this.auth.user()?.id;
      return all.filter(t => t.author_id === me);
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

  authorLabel(topic: any): string {
    if (topic.is_anonymous) return 'Anonimna trudnica';
    return topic.profiles?.full_name ?? 'Korisnica';
  }

  timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diffMs / 3_600_000);
    if (hours < 1) return 'upravo sada';
    if (hours < 24) return `pre ${hours}h`;
    const days = Math.floor(hours / 24);
    return `pre ${days}d`;
  }

  openCreate() {
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
