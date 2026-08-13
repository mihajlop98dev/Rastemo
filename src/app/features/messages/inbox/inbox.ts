import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, MessageCircle } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiAvatar } from '../../../shared/ui/avatar/avatar';
import { MessagesService } from '../../../core/services/messages.service';

@Component({
  selector: 'app-messages-inbox',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiAvatar],
  templateUrl: './inbox.html',
  styleUrl: './inbox.scss'
})
export class MessagesInbox implements OnInit {
  constructor(readonly messagesSvc: MessagesService) {}

  async ngOnInit() {
    await this.messagesSvc.loadConversations();
  }

  timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diffMs / 3_600_000);
    if (hours < 1) return 'upravo sada';
    if (hours < 24) return `pre ${hours}h`;
    const days = Math.floor(hours / 24);
    return `pre ${days}d`;
  }

  readonly MessageIcon = MessageCircle;
}
