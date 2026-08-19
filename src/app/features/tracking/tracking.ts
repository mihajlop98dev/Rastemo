import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { LOKAL } from '../../core/data/lokalizacija';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Plus, AlertTriangle, Search, Trash2, Timer, Pill, Minus, Pencil } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiAvatar } from '../../shared/ui/avatar/avatar';
import { UiButton } from '../../shared/ui/button/button';
import { UiTabs, UiTabItem } from '../../shared/ui/tabs/tabs';
import { UiMedicalNotice } from '../../shared/ui/medical-notice/medical-notice';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { PregnancyService } from '../../core/services/pregnancy.service';
import { SymptomService } from '../../core/services/symptom.service';
import { MoodService } from '../../core/services/mood.service';
import { WeightService } from '../../core/services/weight.service';
import { DiaryService } from '../../core/services/diary.service';
import { ContractionService } from '../../core/services/contraction.service';
import { MedicationService } from '../../core/services/medication.service';
import { bmiFor, bmiCategoryFor, recommendedWeightRangeForWeek, BMI_CATEGORY_LABELS } from '../../core/data/weight-guidance';

interface SymptomDef {
  name: string;
  emoji: string;
  /** Postoji samo za simptome koje je korisnica sama dodala. */
  customId?: string;
}

const MOOD_EMOJI: Record<number, string> = { 1: '😢', 2: '🙁', 3: '😐', 4: '🙂', 5: '😄' };

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCard, UiAvatar, UiButton, UiTabs, UiMedicalNotice, RouterLink],
  templateUrl: './tracking.html',
  styleUrl: './tracking.scss'
})
export class Tracking implements OnInit, OnDestroy {
  readonly tabs: UiTabItem[] = [
    { id: 'simptomi', label: 'Simptomi' },
    { id: 'raspolozenje', label: 'Raspoloženje' },
    { id: 'tezina', label: 'Težina' },
    { id: 'kontrakcije', label: 'Kontrakcije' },
    { id: 'terapija', label: 'Terapija' },
    { id: 'beleske', label: 'Beleške' },
  ];
  activeTab = 'simptomi';

  /** Podrazumevani simptomi; korisnica ispod njih dodaje svoje. */
  readonly defaultSymptoms: SymptomDef[] = [
    { name: 'Mučnina', emoji: '🤢' },
    { name: 'Umor', emoji: '😴' },
    { name: 'Bol u leđima', emoji: '🦴' },
    { name: 'Nadutost', emoji: '🌾' },
  ];

  /** Emoji ponuđeni pri dodavanju — kucanje emojija na desktopu je nezgodno.
   *  Namerno samo simptomi i telesni osećaji, bez figura ljudi. */
  readonly symptomEmojis = ['🩺', '🤕', '🌙', '💧', '🔥', '😵‍💫', '🦵', '🤧', '💤', '🍋', '🌡️', '💗'];

  readonly showAddSymptom = signal(false);
  readonly addingSymptom = signal(false);
  readonly symptomError = signal('');
  newSymptomName = '';
  newSymptomEmoji = '🩺';

  get symptomCatalog(): SymptomDef[] {
    return [
      ...this.defaultSymptoms,
      ...this.symptomSvc.custom().map(c => ({ name: c.name, emoji: c.emoji, customId: c.id })),
    ];
  }

  readonly levels = [1, 2, 3] as const;
  readonly moodLevels = [1, 2, 3, 4, 5] as const;
  readonly MOOD_EMOJI = MOOD_EMOJI;

  readonly todayLabel = new Date().toLocaleDateString(LOKAL, { day: 'numeric', month: 'long' });

  moodNote = '';
  weightInput: number | null = null;
  prePregnancyWeightInput: number | null = null;
  heightInput: number | null = null;
  diaryTitle = '';
  diaryContent = '';

  readonly elapsedSeconds = signal(0);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  newMedName = '';
  newMedType: 'terapija' | 'suplement' = 'terapija';
  newMedDose = 1;

  // --- izmena postojećeg unosa ---
  readonly medUIzmeni = signal<string | null>(null);
  izmenaNaziv = '';
  izmenaTip: 'terapija' | 'suplement' = 'terapija';
  izmenaDoza = 1;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    readonly profileSvc: ProfileService,
    readonly pregnancy: PregnancyService,
    readonly symptomSvc: SymptomService,
    readonly moodSvc: MoodService,
    readonly weightSvc: WeightService,
    readonly diarySvc: DiaryService,
    readonly contractionSvc: ContractionService,
    readonly medicationSvc: MedicationService,
  ) {}

  async ngOnInit() {
    const tabParam = this.route.snapshot.queryParamMap.get('tab');
    if (tabParam && this.tabs.some(t => t.id === tabParam)) this.activeTab = tabParam;

    if (!this.profileSvc.profile()) await this.profileSvc.load();
    const p = this.pregnancy.active();
    if (p) {
      await Promise.all([
        this.symptomSvc.loadToday(p.id),
        this.symptomSvc.loadLastWeek(p.id),
        this.symptomSvc.loadCustom(p.id),
        this.moodSvc.loadToday(p.id),
        this.moodSvc.loadLastWeek(p.id),
        this.weightSvc.loadAll(p.id),
        this.diarySvc.loadAll(p.id),
        this.contractionSvc.loadAll(p.id),
        this.medicationSvc.loadAll(p.id),
      ]);
      this.moodNote = this.moodSvc.today()?.note ?? '';
      this.weightInput = this.weightSvc.latest?.weight_kg ?? this.profileSvc.profile()?.weight_kg ?? null;
      this.prePregnancyWeightInput = p.pre_pregnancy_weight_kg;
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  levelFor(name: string): number {
    return this.symptomSvc.today().find(e => e.name === name)?.level ?? 0;
  }


  openAddSymptom() {
    this.newSymptomName = '';
    this.newSymptomEmoji = '🩺';
    this.symptomError.set('');
    this.showAddSymptom.set(true);
  }

  closeAddSymptom() {
    this.showAddSymptom.set(false);
  }

  async submitAddSymptom() {
    const p = this.pregnancy.active();
    const name = this.newSymptomName.trim();
    if (!p || !name) return;

    const exists = this.symptomCatalog.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      this.symptomError.set('Taj simptom već postoji na listi.');
      return;
    }

    this.addingSymptom.set(true);
    this.symptomError.set('');
    try {
      await this.symptomSvc.addCustom(p.id, name, this.newSymptomEmoji);
      this.showAddSymptom.set(false);
    } catch {
      this.symptomError.set('Nismo uspeli da sačuvamo simptom. Pokušaj ponovo.');
    } finally {
      this.addingSymptom.set(false);
    }
  }

  async removeCustomSymptom(customId: string) {
    await this.symptomSvc.removeCustom(customId);
  }

  /** Ime simptoma za koji se trenutno prikazuje potvrda čuvanja. */
  readonly sacuvanSimptom = signal<string | null>(null);
  private potvrdaTajmer?: ReturnType<typeof setTimeout>;

  /**
   * Unos se čuva odmah po kliku, bez posebnog dugmeta — ali bez povratne
   * informacije korisnica ne zna da li je prošlo. Zato se uz simptom nakratko
   * pojavi potvrda.
   */
  async setLevel(name: string, level: 1 | 2 | 3) {
    const p = this.pregnancy.active();
    if (!p) return;

    // Ponovni klik na isti nivo poništava unos.
    if (this.levelFor(name) === level) {
      await this.symptomSvc.clearLevel(name);
      this.potvrdi(null);
      return;
    }

    await this.symptomSvc.setLevel(p.id, name, level);
    this.potvrdi(name);
  }

  private potvrdi(name: string | null) {
    clearTimeout(this.potvrdaTajmer);
    this.sacuvanSimptom.set(name);
    if (name) this.potvrdaTajmer = setTimeout(() => this.sacuvanSimptom.set(null), 2200);
  }

  async setMood(mood: 1 | 2 | 3 | 4 | 5) {
    const p = this.pregnancy.active();
    if (!p) return;
    await this.moodSvc.setMood(p.id, mood, this.moodNote);
  }

  async saveWeight() {
    const p = this.pregnancy.active();
    if (!p || !this.weightInput) return;
    await this.weightSvc.logToday(p.id, this.weightInput);
  }

  /**
   * Opseg traži i visinu i težinu pre trudnoće. Ranije se tražila samo težina,
   * pa bi je korisnica unela i opseg se i dalje ne bi pojavio — visina se nigde
   * nije tražila osim u Profilu. Zato ovde nedostaje ono što stvarno nedostaje.
   */
  get profileHeight(): number | null {
    return this.profileSvc.profile()?.height_cm ?? null;
  }

  get missingForRange(): boolean {
    return !this.prePregnancyWeight || !this.profileHeight;
  }

  get missingForRangeText(): string {
    if (!this.prePregnancyWeight && !this.profileHeight) {
      return 'Unesi visinu i težinu pre trudnoće da vidimo preporučeni opseg dobijanja na težini.';
    }
    if (!this.prePregnancyWeight) {
      return 'Unesi težinu pre trudnoće da vidimo preporučeni opseg dobijanja na težini.';
    }
    return 'Fali nam još tvoja visina da izračunamo preporučeni opseg.';
  }

  get canSaveBaseline(): boolean {
    const weightOk = !!this.prePregnancyWeight || !!this.prePregnancyWeightInput;
    const heightOk = !!this.profileHeight || !!this.heightInput;
    return weightOk && heightOk;
  }

  async saveBaseline() {
    if (this.prePregnancyWeightInput && !this.prePregnancyWeight) {
      await this.pregnancy.update({ pre_pregnancy_weight_kg: this.prePregnancyWeightInput });
    }
    if (this.heightInput && !this.profileHeight) {
      await this.profileSvc.update({ height_cm: this.heightInput });
    }
  }

  get prePregnancyWeight(): number | null {
    return this.pregnancy.active()?.pre_pregnancy_weight_kg ?? null;
  }

  get currentWeight(): number | null {
    return this.weightSvc.latest?.weight_kg ?? this.profileSvc.profile()?.weight_kg ?? null;
  }

  /** BMI pre trudnoće, zaokružen na jednu decimalu. */
  get bmi(): number | null {
    const height = this.profileSvc.profile()?.height_cm;
    const preWeight = this.prePregnancyWeight;
    if (!height || !preWeight) return null;
    return Math.round(bmiFor(height, preWeight) * 10) / 10;
  }

  /** Šta korisnici fali da bismo mogli da izračunamo BMI. */
  get bmiNedostaje(): string | null {
    const height = this.profileSvc.profile()?.height_cm;
    const preWeight = this.prePregnancyWeight;
    if (height && preWeight) return null;
    if (!height && !preWeight) return 'visina i težina pre trudnoće';
    return !height ? 'visina' : 'težina pre trudnoće';
  }

  get bmiCategoryLabel(): string | null {
    const height = this.profileSvc.profile()?.height_cm;
    const preWeight = this.prePregnancyWeight;
    if (!height || !preWeight) return null;
    return BMI_CATEGORY_LABELS[bmiCategoryFor(height, preWeight)];
  }

  get weightRangeNow(): [number, number] | null {
    return this.weightRangeForWeek(this.pregnancy.weekNumber());
  }

  get weightRangeExpected(): [number, number] | null {
    return this.weightRangeForWeek(40);
  }

  private weightRangeForWeek(week: number): [number, number] | null {
    const height = this.profileSvc.profile()?.height_cm;
    const preWeight = this.prePregnancyWeight;
    if (!height || !preWeight) return null;
    const category = bmiCategoryFor(height, preWeight);
    return recommendedWeightRangeForWeek(category, preWeight, week);
  }

  // --- Kontrakcije ---

  startContractionTimer() {
    this.contractionSvc.startTimer();
    this.elapsedSeconds.set(0);
    this.timerInterval = setInterval(() => this.elapsedSeconds.update(s => s + 1), 1000);
  }

  async stopContractionTimer() {
    const p = this.pregnancy.active();
    if (!p) return;
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    await this.contractionSvc.stopTimer(p.id);
    this.elapsedSeconds.set(0);
  }

  cancelContractionTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.contractionSvc.cancelTimer();
    this.elapsedSeconds.set(0);
  }

  async removeContraction(id: string) {
    await this.contractionSvc.remove(id);
  }

  formatDuration(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleTimeString(LOKAL, { hour: '2-digit', minute: '2-digit' });
  }

  intervalLabel(index: number): string {
    const sec = this.contractionSvc.intervalSecondsFor(index);
    return sec === null ? '—' : this.formatDuration(sec);
  }

  // --- Terapija / suplementi ---

  async addMedication() {
    const p = this.pregnancy.active();
    if (!p || !this.newMedName.trim()) return;
    await this.medicationSvc.add(p.id, this.newMedName.trim(), this.newMedType, this.newMedDose);
    this.newMedName = '';
    this.newMedType = 'terapija';
    this.newMedDose = 1;
  }

  async removeMedication(id: string) {
    await this.medicationSvc.remove(id);
  }

  /**
   * Izmena umesto brisanja i ponovnog unosa: ako korisnica promeni preparat,
   * istorija uzimanja ostaje vezana za isti unos.
   */
  pocniIzmenu(m: { id: string; name: string; type: 'terapija' | 'suplement'; dose_per_day: number }) {
    this.medUIzmeni.set(m.id);
    this.izmenaNaziv = m.name;
    this.izmenaTip = m.type;
    this.izmenaDoza = m.dose_per_day;
  }

  otkaziIzmenu() {
    this.medUIzmeni.set(null);
  }

  async sacuvajIzmenu(id: string) {
    const naziv = this.izmenaNaziv.trim();
    if (!naziv) return;
    await this.medicationSvc.update(id, {
      name: naziv,
      type: this.izmenaTip,
      dose_per_day: this.izmenaDoza,
    });
    this.medUIzmeni.set(null);
  }

  async logDose(id: string) {
    await this.medicationSvc.logDose(id);
  }

  async undoDose(id: string) {
    await this.medicationSvc.undoDose(id);
  }

  async saveDiaryEntry() {
    const p = this.pregnancy.active();
    if (!p || !this.diaryTitle.trim() || !this.diaryContent.trim()) return;
    await this.diarySvc.create(p.id, this.diaryTitle.trim(), this.diaryContent.trim());
    this.diaryTitle = '';
    this.diaryContent = '';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(LOKAL, { day: 'numeric', month: 'short' });
  }

  get trendDays(): string[] {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString(LOKAL, { weekday: 'short' }).replace('.', ''));
    }
    return days;
  }

  get trendValues(): number[] {
    const byDate = new Map<string, number[]>();
    for (const e of this.symptomSvc.lastWeek()) {
      const arr = byDate.get(e.logged_date) ?? [];
      arr.push(e.level);
      byDate.set(e.logged_date, arr);
    }
    return this.buildSeries(byDate);
  }

  get moodTrendValues(): number[] {
    const byDate = new Map<string, number[]>();
    for (const e of this.moodSvc.lastWeek()) {
      byDate.set(e.logged_date, [e.mood]);
    }
    return this.buildSeries(byDate);
  }

  private buildSeries(byDate: Map<string, number[]>): number[] {
    const values: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const arr = byDate.get(iso);
      const avg = arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      values.push(avg);
    }
    return values;
  }

  trendPointsFor(values: number[], max: number): string {
    const w = 280, h = 90, pad = 10;
    return values
      .map((v, i) => {
        const x = pad + (i * (w - pad * 2)) / (values.length - 1);
        const y = h - pad - (v / max) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }

  trendCx(i: number, count: number): number {
    return 10 + (i * 260) / (count - 1);
  }

  trendCy(v: number, max: number): number {
    return 80 - (v / max) * 70;
  }

  async removeDiaryEntry(id: string) {
    await this.diarySvc.remove(id);
  }

  async saveMoodNote() {
    const current = (this.moodSvc.today()?.mood ?? 3) as 1 | 2 | 3 | 4 | 5;
    await this.setMood(current);
  }

  get weightSeries(): { x: number; y: number }[] {
    const entries = this.weightSvc.entries();
    if (entries.length < 2) return [];
    const values = entries.map(e => e.weight_kg);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 280, h = 90, pad = 10;
    return entries.map((e, i) => ({
      x: pad + (i * (w - pad * 2)) / (entries.length - 1),
      y: h - pad - ((e.weight_kg - min) / range) * (h - pad * 2),
    }));
  }

  get weightPointsStr(): string {
    return this.weightSeries.map(p => `${p.x},${p.y}`).join(' ');
  }

  get diaryEntriesDesc() {
    return this.diarySvc.entries();
  }

  readonly PlusIcon = Plus;
  readonly AlertIcon = AlertTriangle;
  readonly SearchIcon = Search;
  readonly TrashIcon = Trash2;
  readonly PencilIcon = Pencil;
  readonly TimerIcon = Timer;
  readonly PillIcon = Pill;
  readonly MinusIcon = Minus;
}
