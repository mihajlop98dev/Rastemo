import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiTabs, UiTabItem } from '../../shared/ui/tabs/tabs';
import { upcomingAppointments, Appointment } from '../../core/data/mock-data';

interface CalendarDay {
  day: number;
  inMonth: boolean;
  isToday?: boolean;
  isSelected?: boolean;
  dots?: ('primary' | 'sage' | 'gold')[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, UiButton, UiTabs],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class CalendarPage {
  readonly weekDayLabels = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
  readonly monthLabel = 'Avgust 2026.';
  readonly selectedDay = 18;

  readonly viewTabs: UiTabItem[] = [
    { id: 'week', label: 'Nedelja' },
    { id: 'month', label: 'Mesec' },
    { id: 'planner', label: 'Planer' },
  ];
  activeView = 'month';

  readonly appointments: Appointment[] = upcomingAppointments;

  readonly weeks: CalendarDay[][] = this.buildAugust2026();

  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly PlusIcon = Plus;
  readonly SparklesIcon = Sparkles;

  private buildAugust2026(): CalendarDay[][] {
    const eventMap: Record<number, ('primary' | 'sage' | 'gold')[]> = {
      5: ['sage'], 11: ['primary'], 16: ['gold'],
      18: ['primary'], 19: ['sage'], 22: ['primary'],
      25: ['gold'], 26: ['sage'],
    };

    const days: CalendarDay[] = [];
    // July tail (Aug 1, 2026 is a Saturday -> Mon-first grid starts July 27)
    for (let d = 27; d <= 31; d++) days.push({ day: d, inMonth: false });
    for (let d = 1; d <= 31; d++) {
      days.push({
        day: d,
        inMonth: true,
        isSelected: d === this.selectedDay,
        dots: eventMap[d],
      });
    }
    for (let d = 1; d <= 6; d++) days.push({ day: d, inMonth: false });

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return weeks;
  }
}
