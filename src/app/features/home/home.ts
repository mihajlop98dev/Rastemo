import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Baby, Heart, Info, Smile, Scale, PenLine, Stethoscope, ChevronRight, CalendarPlus } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiProgressBar } from '../../shared/ui/progress-bar/progress-bar';
import { BabyVisual } from '../../shared/illustrations/baby-visual/baby-visual';
import { currentUser, weekHighlights, nextAppointment } from '../../core/data/mock-data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiButton, UiBadge, UiProgressBar, BabyVisual],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  readonly user = currentUser;
  readonly highlights = weekHighlights;
  readonly appointment = nextAppointment;

  readonly highlightIcons: Record<string, any> = { baby: Baby, heart: Heart, info: Info };

  readonly quickActions = [
    { label: 'Simptomi', icon: Stethoscope, tone: 'primary' },
    { label: 'Raspoloženje', icon: Smile, tone: 'peach' },
    { label: 'Težina', icon: Scale, tone: 'lavender' },
    { label: 'Beleška', icon: PenLine, tone: 'sage' },
    { label: 'Pregled', icon: CalendarPlus, tone: 'gold' },
  ];

  readonly ChevronIcon = ChevronRight;
  readonly weekProgress = Math.round((this.user.weekNumber / this.user.totalWeeks) * 100);
}
