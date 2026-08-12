import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Send, Sparkles, CircleHelp, FileText, Stethoscope, Salad } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCard],
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.scss'
})
export class AiAssistant {
  readonly suggestions = [
    { icon: CircleHelp, label: 'Da li je ovo normalno?' },
    { icon: FileText, label: 'Objasni mi nalaz' },
    { icon: Stethoscope, label: 'Pitanja za lekara' },
    { icon: Salad, label: 'Saveti za ishranu' },
  ];

  readonly messages = signal<ChatMessage[]>([
    { role: 'ai', text: 'Ćao Marija! 👋 Kako mogu da ti pomognem danas? Trenutno si u 21. nedelji trudnoće.' },
    { role: 'user', text: 'Da li je normalno da osećam stezanje u mišićima trbuha u 21. nedelji?' },
    {
      role: 'ai',
      text: 'Blago stezanje u mišićima trbuha u ovoj fazi trudnoće često je povezano sa istezanjem materice i ligamenata dok beba raste. Ne mogu da procenim tvoje stanje niti da postavim dijagnozu — ako je bol jak, uporan ili te zabrinjava, obrati se svom ginekologu.',
    },
  ]);

  draft = '';

  send() {
    const text = this.draft.trim();
    if (!text) return;
    this.messages.update(m => [...m, { role: 'user', text }]);
    this.draft = '';
    setTimeout(() => {
      this.messages.update(m => [
        ...m,
        { role: 'ai', text: 'Hvala na pitanju! Ovo je samo demo odgovor — ovde bi stigao personalizovani AI odgovor.' },
      ]);
    }, 500);
  }

  useSuggestion(label: string) {
    this.draft = label;
    this.send();
  }

  readonly SendIcon = Send;
  readonly SparklesIcon = Sparkles;
}
