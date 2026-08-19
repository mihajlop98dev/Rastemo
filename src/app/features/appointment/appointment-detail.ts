import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, Bell, FileText, CircleHelp, NotebookPen, MapPin, Clock } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiProgressBar } from '../../shared/ui/progress-bar/progress-bar';
import { PregnancyService } from '../../core/services/pregnancy.service';
import { AppointmentService, AppointmentRow } from '../../core/services/appointment.service';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiButton, UiProgressBar],
  templateUrl: './appointment-detail.html',
  styleUrl: './appointment-detail.scss'
})
export class AppointmentDetail implements OnInit {
  readonly appointment = signal<AppointmentRow | null>(null);
  readonly loading = signal(true);

  // Addressed to the pregnant user herself — the old copy spoke to a partner,
  // which no longer matches the app now that the Partner feature is gone.
  readonly prepTips = [
    { icon: FileText, text: 'Ponesi zdravstvenu knjižicu i prethodne nalaze.' },
    { icon: CircleHelp, text: 'Zapiši pitanja koja želiš da postaviš lekaru.' },
    { icon: Bell, text: 'Dođi 10-15 minuta ranije, bez žurbe.' },
    { icon: NotebookPen, text: 'Posle pregleda zabeleži šta ti je lekar rekao.' },
  ];

  readonly MapPinIcon = MapPin;
  readonly ClockIcon = Clock;

  constructor(
    private route: ActivatedRoute,
    readonly pregnancy: PregnancyService,
    private appointments: AppointmentService,
  ) {}

  get weekProgress() {
    return Math.round((this.pregnancy.weekNumber() / this.pregnancy.totalWeeks) * 100);
  }

  get dueDateLabel(): string {
    const p = this.pregnancy.active();
    if (!p) return '';
    return new Date(p.due_date).toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appointment.set(await this.appointments.getById(id));
    }
    this.loading.set(false);
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

  addToCalendar() {
    const apt = this.appointment();
    if (!apt) return;

    const start = new Date(apt.scheduled_at);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const toIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const location = apt.clinics?.name ?? '';
    const description = [apt.subtitle, apt.doctors ? `Lekar: ${apt.doctors.full_name}` : ''].filter(Boolean).join('\\n');

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dnevnik trudnoce//Pregled//SR',
      'BEGIN:VEVENT',
      `UID:${apt.id}@dnevniktrudnoce`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(start)}`,
      `DTEND:${toIcsDate(end)}`,
      `SUMMARY:${apt.title}`,
      description ? `DESCRIPTION:${description}` : '',
      location ? `LOCATION:${location}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${apt.title.replace(/[^\p{L}\p{N}]+/gu, '-')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
