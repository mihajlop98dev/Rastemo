import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Sparkles, Clock } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard],
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.scss'
})
export class AiAssistant {
  readonly SparklesIcon = Sparkles;
  readonly ClockIcon = Clock;
}
