import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ChevronLeft, ChevronRight, Plus, Sparkles, X } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiTabs, UiTabItem } from '../../shared/ui/tabs/tabs';
import { PregnancyService } from '../../core/services/pregnancy.service';
import { AppointmentService, AppointmentRow } from '../../core/services/appointment.service';

interface CalendarDay {
  date: Date;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  appointments: AppointmentRow[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCard, UiButton, UiTabs],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class CalendarPage implements OnInit {
  readonly weekDayLabels = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];

  readonly viewTabs: UiTabItem[] = [
    { id: 'week', label: 'Nedelja' },
    { id: 'month', label: 'Mesec' },
    { id: 'planer', label: 'Planer' },
  ];
  activeView = 'month';

  viewDate = new Date();
  weeks: CalendarDay[][] = [];

  readonly showCreate = signal(false);
  readonly creating = signal(false);
  newTitle = '';
  newType: AppointmentRow['appointment_type'] = 'pregled';
  newDate = '';
  newTime = '10:00';

  constructor(
    private route: ActivatedRoute,
    private pregnancy: PregnancyService,
    readonly appointments: AppointmentService,
  ) {}

  async ngOnInit() {
    const p = this.pregnancy.active();
    if (p) await this.appointments.loadAll(p.id);
    this.buildMonth();

    if (this.route.snapshot.queryParamMap.get('new')) this.openCreate();
  }

  get monthLabel(): string {
    return this.viewDate.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' });
  }

  get periodLabel(): string {
    if (this.activeView !== 'week') return this.monthLabel;
    const days = this.currentWeekDays;
    const start = days[0].date;
    const end = days[6].date;
    const startLabel = start.toLocaleDateString('sr-RS', { day: 'numeric', month: start.getMonth() === end.getMonth() ? undefined : 'short' });
    const endLabel = end.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startLabel} – ${endLabel}`;
  }

  prevPeriod() {
    if (this.activeView === 'week') {
      const d = new Date(this.viewDate);
      d.setDate(d.getDate() - 7);
      this.viewDate = d;
    } else {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    }
    this.buildMonth();
  }

  nextPeriod() {
    if (this.activeView === 'week') {
      const d = new Date(this.viewDate);
      d.setDate(d.getDate() + 7);
      this.viewDate = d;
    } else {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    }
    this.buildMonth();
  }

  goToday() {
    this.viewDate = new Date();
    this.buildMonth();
  }

  private appointmentsByDate(): Map<string, AppointmentRow[]> {
    const byDate = new Map<string, AppointmentRow[]>();
    for (const apt of this.appointments.all()) {
      const iso = apt.scheduled_at.slice(0, 10);
      const arr = byDate.get(iso) ?? [];
      arr.push(apt);
      byDate.set(iso, arr);
    }
    return byDate;
  }

  private buildMonth() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
    const startDate = new Date(year, month, 1 - firstWeekday);

    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const byDate = this.appointmentsByDate();

    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      days.push({
        date: d,
        day: d.getDate(),
        inMonth: d.getMonth() === month,
        isToday: iso === todayIso,
        isSelected: false,
        appointments: byDate.get(iso) ?? [],
      });
    }

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    this.weeks = weeks;
  }

  get currentWeekDays(): CalendarDay[] {
    const start = new Date(this.viewDate);
    const weekday = (start.getDay() + 6) % 7; // Monday = 0
    start.setDate(start.getDate() - weekday);

    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const byDate = this.appointmentsByDate();

    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      days.push({
        date: d,
        day: d.getDate(),
        inMonth: true,
        isToday: iso === todayIso,
        isSelected: false,
        appointments: byDate.get(iso) ?? [],
      });
    }
    return days;
  }

  get plannerGroups(): { dateLabel: string; items: AppointmentRow[] }[] {
    const groups: { dateLabel: string; items: AppointmentRow[] }[] = [];
    for (const apt of this.appointments.all()) {
      const label = new Date(apt.scheduled_at).toLocaleDateString('sr-RS', { weekday: 'long', day: 'numeric', month: 'long' });
      const last = groups[groups.length - 1];
      if (last && last.dateLabel === label) {
        last.items.push(apt);
      } else {
        groups.push({ dateLabel: label, items: [apt] });
      }
    }
    return groups;
  }

  openCreate() {
    this.newTitle = '';
    this.newType = 'pregled';
    this.newDate = new Date().toISOString().slice(0, 10);
    this.newTime = '10:00';
    this.showCreate.set(true);
  }

  closeCreate() {
    this.showCreate.set(false);
  }

  async submitCreate() {
    const p = this.pregnancy.active();
    if (!p || !this.newTitle || !this.newDate) return;

    this.creating.set(true);
    try {
      const scheduledAt = new Date(`${this.newDate}T${this.newTime}:00`).toISOString();
      await this.appointments.create({
        pregnancy_id: p.id,
        title: this.newTitle,
        appointment_type: this.newType,
        scheduled_at: scheduledAt,
      });
      this.buildMonth();
      this.showCreate.set(false);
    } finally {
      this.creating.set(false);
    }
  }

  formatDay(iso: string): string {
    return new Date(iso).toLocaleDateString('sr-RS', { day: '2-digit' });
  }

  formatMonth(iso: string): string {
    return new Date(iso).toLocaleDateString('sr-RS', { month: 'short' }).toUpperCase().replace('.', '');
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
  }

  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly PlusIcon = Plus;
  readonly SparklesIcon = Sparkles;
  readonly XIcon = X;
}
