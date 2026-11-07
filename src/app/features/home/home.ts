import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { LOKAL } from '../../core/data/lokalizacija';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule, Smile, Scale, PenLine, Stethoscope, ChevronRight, X, ChevronLeft,
  Sparkles, ShoppingBag, Check, Users, Hospital, CalendarDays, Bell, Flag,
} from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiProgressBar } from '../../shared/ui/progress-bar/progress-bar';
import { BabyVisual } from '../../shared/illustrations/baby-visual/baby-visual';
import { PushPoziv } from '../../shared/push-poziv/push-poziv';
import { ProfileService } from '../../core/services/profile.service';
import { PregnancyService } from '../../core/services/pregnancy.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { PushService } from '../../core/services/push.service';
import { babyComparisonForWeek, babyLengthForWeek, babyWeightForWeek } from '../../core/data/baby-growth';
import { vodicZaNedelju } from '../../core/data/vodic-nedelje';
import { NASLOV_VRSTE, danaTekst, sledecaPrekretnica, stavkaZaDan } from '../../core/data/dnevni-sadrzaj';

/** Pre 8. nedelje beba je lakša od grama, pa "0 g" ne bi bilo tačno. */
function formatGrams(g: number): string {
  return g < 1 ? 'manje od 1' : String(g);
}

const KLJUC_KORACI_SKRIVENI = 'dnevnik-prvi-koraci-skriveni';
const KLJUC_PODSETNIK_VIDJEN = 'dnevnik-prvi-koraci-podsetnik';

function procitaj(kljuc: string): boolean {
  try { return typeof localStorage !== 'undefined' && !!localStorage.getItem(kljuc); } catch { return false; }
}
function zapisi(kljuc: string) {
  try { localStorage.setItem(kljuc, '1'); } catch { /* privatni režim — nije bitno */ }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiButton, UiProgressBar, BabyVisual, PushPoziv],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  readonly quickActions = [
    { label: 'Simptomi', icon: Stethoscope, tone: 'primary', tab: 'simptomi' },
    { label: 'Raspoloženje', icon: Smile, tone: 'peach', tab: 'raspolozenje' },
    { label: 'Težina', icon: Scale, tone: 'lavender', tab: 'tezina' },
    { label: 'Beleška', icon: PenLine, tone: 'sage', tab: 'beleske' },
  ];

  /** Delovi aplikacije koji nisu u donjem meniju — ovo im je ulaz na telefonu. */
  readonly jos = [
    { label: 'Pregledi i kalendar', opis: 'Svi zakazani pregledi i analize', link: '/calendar', icon: CalendarDays },
    { label: 'Priprema', opis: 'Torba za porodilište i kupovina za bebu', link: '/preparation', icon: ShoppingBag },
    { label: 'Lekari', opis: 'Ginekolozi i ocene drugih mama', link: '/doctors', icon: Stethoscope },
    { label: 'Porodilišta', opis: 'Adrese i telefoni po gradovima', link: '/porodilista', icon: Hospital },
    { label: 'Zajednica', opis: 'Pitanja i iskustva drugih trudnica', link: '/zajednica', icon: Users },
    { label: 'Zabava', opis: 'Imena, anketa za ime, horoskop bebe', link: '/zabava', icon: Sparkles },
  ];

  readonly ChevronIcon = ChevronRight;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly XIcon = X;
  readonly CheckIcon = Check;
  readonly BellIcon = Bell;
  readonly FlagIcon = Flag;

  readonly viewerOpen = signal(false);
  readonly viewerWeek = signal(8);
  readonly VIEWER_MIN_WEEK = 4;
  readonly VIEWER_MAX_WEEK = 42;

  // --- Prvi koraci ---
  readonly imaUnos = signal<boolean | null>(null);
  readonly podsetnikGotov = signal(procitaj(KLJUC_PODSETNIK_VIDJEN));
  readonly koraciSkriveni = signal(procitaj(KLJUC_KORACI_SKRIVENI));
  readonly prikaziPush = signal(false);

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    readonly push: PushService,
    readonly profileSvc: ProfileService,
    readonly pregnancy: PregnancyService,
    readonly appointments: AppointmentService,
  ) {
    effect(() => {
      const p = this.pregnancy.active();
      if (p) this.proveriUnose(p.id);
    });
  }

  async ngOnInit() {
    if (!this.profileSvc.profile()) await this.profileSvc.load();
    const p = this.pregnancy.active();
    if (p) await this.appointments.loadAll(p.id);
    if (typeof window !== 'undefined') {
      const s = await this.push.procitajStanje();
      if (s === 'ukljuceno') this.podsetnikGotov.set(true);
    }
  }

  /** Da li je korisnica ikad nešto zabeležila — samo broj, bez sadržaja. */
  private async proveriUnose(pregnancyId: string) {
    const [simptomi, raspolozenje] = await Promise.all([
      this.supabase.client.from('symptom_entries').select('id', { count: 'exact', head: true }).eq('pregnancy_id', pregnancyId),
      this.supabase.client.from('mood_entries').select('id', { count: 'exact', head: true }).eq('pregnancy_id', pregnancyId),
    ]);
    this.imaUnos.set((simptomi.count ?? 0) + (raspolozenje.count ?? 0) > 0);
  }

  get koraci() {
    return [
      { id: 'unos', naslov: 'Zabeleži kako se danas osećaš', opis: 'Jedan dodir — raspoloženje ili simptom.', gotovo: !!this.imaUnos() },
      { id: 'pregled', naslov: 'Upiši sledeći pregled', opis: 'Da ti ne promakne nijedan termin.', gotovo: this.appointments.all().length > 0 },
      { id: 'podsetnik', naslov: 'Uključi podsetnike', opis: 'Javimo ti kad počne nova nedelja.', gotovo: this.podsetnikGotov() },
    ];
  }

  get brojGotovih() { return this.koraci.filter(k => k.gotovo).length; }

  get prikaziKorake(): boolean {
    return !this.koraciSkriveni() && this.imaUnos() !== null && this.brojGotovih < this.koraci.length;
  }

  pokreniKorak(id: string) {
    if (id === 'unos') this.router.navigate(['/tracking'], { queryParams: { tab: 'raspolozenje' } });
    else if (id === 'pregled') this.router.navigate(['/calendar'], { queryParams: { new: 1 } });
    else this.prikaziPush.set(true);
  }

  zatvoriPush() {
    this.prikaziPush.set(false);
    this.podsetnikGotov.set(true);
    zapisi(KLJUC_PODSETNIK_VIDJEN);
  }

  sakrijKorake() {
    this.koraciSkriveni.set(true);
    zapisi(KLJUC_KORACI_SKRIVENI);
  }

  // --- Sadržaj ---
  get pozdrav(): string {
    const sat = new Date().getHours();
    const deo = sat < 11 ? 'Dobro jutro' : sat < 18 ? 'Dobar dan' : 'Dobro veče';
    return `${deo}, ${this.firstName}`;
  }

  get firstName(): string {
    const full = this.profileSvc.profile()?.full_name ?? '';
    return full.split(' ')[0] || 'mama';
  }

  get babyName(): string | null {
    return this.pregnancy.active()?.baby_name ?? null;
  }

  readonly danTrudnoce = computed(() => this.pregnancy.gestationDays());
  readonly danas = computed(() => stavkaZaDan(this.danTrudnoce()));
  readonly naslovDanas = computed(() => NASLOV_VRSTE[this.danas().vrsta]);
  readonly prekretnica = computed(() => sledecaPrekretnica(this.danTrudnoce()));
  readonly vodic = computed(() => vodicZaNedelju(Math.min(Math.max(this.pregnancy.weekNumber(), 4), 42)));
  readonly doTermina = computed(() => Math.max(280 - this.danTrudnoce(), 0));

  danaTekst = danaTekst;

  runQuickAction(action: { tab: string | null }) {
    if (action.tab) {
      this.router.navigate(['/tracking'], { queryParams: { tab: action.tab } });
    } else {
      this.router.navigate(['/calendar'], { queryParams: { new: 1 } });
    }
  }

  openViewer() {
    this.viewerWeek.set(Math.min(Math.max(this.weekNumber, this.VIEWER_MIN_WEEK), this.VIEWER_MAX_WEEK));
    this.viewerOpen.set(true);
  }

  closeViewer() { this.viewerOpen.set(false); }
  prevViewerWeek() { this.viewerWeek.update(w => Math.max(w - 1, this.VIEWER_MIN_WEEK)); }
  nextViewerWeek() { this.viewerWeek.update(w => Math.min(w + 1, this.VIEWER_MAX_WEEK)); }

  get viewerLength() { return babyLengthForWeek(this.viewerWeek()); }
  get viewerWeight() { return formatGrams(babyWeightForWeek(this.viewerWeek())); }
  get viewerComparison() { return babyComparisonForWeek(this.viewerWeek()); }

  get weekNumber() { return this.pregnancy.weekNumber(); }
  get weekDay() { return this.pregnancy.weekDay(); }
  get mesec() { return this.pregnancy.mesec(); }
  get dueDateLabel(): string {
    const p = this.pregnancy.active();
    if (!p) return '';
    const [g, m, d] = p.due_date.split('-').map(Number);
    return new Date(g, m - 1, d).toLocaleDateString(LOKAL, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  get babyLength() { return String(babyLengthForWeek(this.weekNumber)).replace('.', ','); }
  get babyWeight() { return formatGrams(babyWeightForWeek(this.weekNumber)); }
  get babyComparison() { return babyComparisonForWeek(this.weekNumber); }

  readonly weekProgress = computed(() => Math.round((this.danTrudnoce() / 280) * 100));

  get nextAppointment() {
    return this.appointments.upcoming[0] ?? null;
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
}
