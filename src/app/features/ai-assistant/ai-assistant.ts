import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Sparkles, Send } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiMedicalNotice } from '../../shared/ui/medical-notice/medical-notice';
import { AiChatService } from '../../core/services/ai-chat.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCard, UiButton, UiMedicalNotice],
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.scss'
})
export class AiAssistant implements OnInit {
  draft = '';

  /**
   * Predlozi su namerno pitanja na koja baza znanja ima odgovor. Prvo pitanje
   * koje korisnica postavi određuje kakav utisak nosi o pomoćniku — ako
   * odmah dobije "ne znam", neće se vratiti.
   */
  readonly suggestions = [
    'Šta ne smem da jedem u trudnoći?',
    'Kada se osete prvi pokreti bebe?',
    'Koliko je normalno da dobijem na težini?',
    'Šta se dešava na prvom ultrazvuku?',
  ];

  readonly SparklesIcon = Sparkles;
  readonly SendIcon = Send;

  constructor(readonly chat: AiChatService) {}

  async ngOnInit() {
    await this.chat.init();
  }

  submit() {
    const text = this.draft.trim();
    if (!text) return;
    this.draft = '';
    this.chat.send(text);
  }

  ask(question: string) {
    this.draft = question;
    this.submit();
  }
}
