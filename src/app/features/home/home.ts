import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Baby, Heart, Info, Smile, Scale, PenLine, Stethoscope, ChevronRight, CalendarPlus, X, ChevronLeft } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiProgressBar } from '../../shared/ui/progress-bar/progress-bar';
import { BabyVisual } from '../../shared/illustrations/baby-visual/baby-visual';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { PregnancyService } from '../../core/services/pregnancy.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { babyComparisonForWeek, babyLengthForWeek, babyWeightForWeek, homeHighlightsForWeek } from '../../core/data/baby-growth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiButton, UiBadge, UiProgressBar, BabyVisual],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  readonly highlightIcons: Record<string, any> = { baby: Baby, heart: Heart, info: Info };

  readonly quickActions = [
    { label: 'Simptomi', icon: Stethoscope, tone: 'primary', tab: 'simptomi' },
    { label: 'Raspoloženje', icon: Smile, tone: 'peach', tab: 'raspolozenje' },
    { label: 'Težina', icon: Scale, tone: 'lavender', tab: 'tezina' },
    { label: 'Beleška', icon: PenLine, tone: 'sage', tab: 'beleske' },
    { label: 'Pregled', icon: CalendarPlus, tone: 'gold', tab: null },
  ];

  readonly ChevronIcon = ChevronRight;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly XIcon = X;

  readonly viewerOpen = signal(false);
  readonly viewerWeek = signal(8);
  readonly VIEWER_MIN_WEEK = 8;
  readonly VIEWER_MAX_WEEK = 40;

  constructor(
    private auth: AuthService,
    private router: Router,
    readonly profileSvc: ProfileService,
    readonly pregnancy: PregnancyService,
    readonly appointments: AppointmentService,
  ) {}

  get highlights() {
    return homeHighlightsForWeek(this.weekNumber);
  }

  runQuickAction(action: { tab: string | null }) {
    if (action.tab) {
      this.router.navigate(['/tracking'], { queryParams: { tab: action.tab } });
    } else {
      this.router.navigate(['/calendar'], { queryParams: { new: 1 } });
    }
  }

  logMoodNow() {
    this.router.navigate(['/tracking'], { queryParams: { tab: 'raspolozenje' } });
  }

  async ngOnInit() {
    if (!this.profileSvc.profile()) await this.profileSvc.load();
    const p = this.pregnancy.active();
    if (p) await this.appointments.loadAll(p.id);
  }

  get firstName(): string {
    const full = this.profileSvc.profile()?.full_name ?? '';
    return full.split(' ')[0] || 'trudnice';
  }

  get babyName(): string | null {
    return this.pregnancy.active()?.baby_name ?? null;
  }

  get greeting(): string {
    return this.babyName ? `Ćao, ${this.firstName} i ${this.babyName}!` : `Ćao, ${this.firstName}!`;
  }

  openViewer() {
    this.viewerWeek.set(Math.min(Math.max(this.weekNumber, this.VIEWER_MIN_WEEK), this.VIEWER_MAX_WEEK));
    this.viewerOpen.set(true);
  }

  closeViewer() {
    this.viewerOpen.set(false);
  }

  prevViewerWeek() {
    this.viewerWeek.update(w => Math.max(w - 1, this.VIEWER_MIN_WEEK));
  }

  nextViewerWeek() {
    this.viewerWeek.update(w => Math.min(w + 1, this.VIEWER_MAX_WEEK));
  }

  get viewerLength() { return babyLengthForWeek(this.viewerWeek()); }
  get viewerWeight() { return babyWeightForWeek(this.viewerWeek()); }
  get viewerComparison() { return babyComparisonForWeek(this.viewerWeek()); }

  get weekNumber() { return this.pregnancy.weekNumber(); }
  get weekDay() { return this.pregnancy.weekDay(); }
  get totalWeeks() { return this.pregnancy.totalWeeks; }
  get dueDateLabel(): string {
    const p = this.pregnancy.active();
    if (!p) return '';
    return new Date(p.due_date).toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  get babyLength() { return babyLengthForWeek(this.weekNumber); }
  get babyWeight() { return babyWeightForWeek(this.weekNumber); }
  get babyComparison() { return babyComparisonForWeek(this.weekNumber); }

  readonly weekProgress = computed(() => Math.round((this.pregnancy.weekNumber() / this.pregnancy.totalWeeks) * 100));

  get nextAppointment() {
    return this.appointments.upcoming[0] ?? null;
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
}
