import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Send } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiAvatar } from '../../../shared/ui/avatar/avatar';
import { AuthService } from '../../../core/services/auth.service';
import { MessagesService } from '../../../core/services/messages.service';

@Component({
  selector: 'app-messages-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiAvatar],
  templateUrl: './thread.html',
  styleUrl: './thread.scss'
})
export class MessagesThread implements OnInit {
  readonly conversationId = signal('');
  readonly otherName = signal('');
  readonly otherUserId = signal('');
  draft = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    readonly messagesSvc: MessagesService,
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.conversationId.set(id);

    if (!this.messagesSvc.conversations().length) {
      await this.messagesSvc.loadConversations();
    }
    const conv = this.messagesSvc.conversations().find(c => c.id === id);
    if (conv) {
      this.otherName.set(conv.otherName);
      this.otherUserId.set(conv.otherUserId);
    }

    await this.messagesSvc.loadMessages(id);
  }

  isMine(senderId: string): boolean {
    return senderId === this.auth.user()?.id;
  }

  async send() {
    const text = this.draft.trim();
    if (!text) return;
    this.draft = '';
    await this.messagesSvc.send(this.conversationId(), this.otherUserId(), text);
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
  }

  readonly BackIcon = ArrowLeft;
  readonly SendIcon = Send;
}
