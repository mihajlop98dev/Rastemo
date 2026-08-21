import { Component, OnInit, signal } from '@angular/core';
import { LOKAL } from '../../core/data/lokalizacija';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, Bell, FileText, CircleHelp, NotebookPen, MapPin, Clock } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiProgressBar } from '../../shared/ui/progress-bar/progress-bar';
import { PregnancyService } from '../../core/services/pregnancy.service';
import { KalendarIzvozService } from '../../core/services/kalendar-izvoz.service';
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

  readonly brisem = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    readonly pregnancy: PregnancyService,
    private appointments: AppointmentService,
    private izvoz: KalendarIzvozService,
  ) {}

  /** Posle brisanja nema čemu da se vrati — vodimo je na kalendar. */
  async obrisi(id: string) {
    if (this.brisem()) return;
    this.brisem.set(true);
    try {
      await this.appointments.remove(id);
      this.router.navigateByUrl('/calendar');
    } finally {
      this.brisem.set(false);
    }
  }

  get weekProgress() {
    return Math.round((this.pregnancy.weekNumber() / this.pregnancy.totalWeeks) * 100);
  }

  get dueDateLabel(): string {
    const p = this.pregnancy.active();
    if (!p) return '';
    return new Date(p.due_date).toLocaleDateString(LOKAL, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appointment.set(await this.appointments.getById(id));
    }
    this.loading.set(false);
  }

  formatDay(iso: string): string {
    return new Date(iso).toLocaleDateString(LOKAL, { day: '2-digit' });
  }

  formatMonth(iso: string): string {
    return new Date(iso).toLocaleDateString(LOKAL, { month: 'short' }).toUpperCase().replace('.', '');
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString(LOKAL, { hour: '2-digit', minute: '2-digit' });
  }

  addToCalendar() {
    const apt = this.appointment();
    if (apt) this.izvoz.preuzmi(apt);
  }

  googleVeza(apt: AppointmentRow): string {
    return this.izvoz.googleVeza(apt);
  }
}
