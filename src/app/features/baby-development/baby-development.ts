import { Component, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check, Brain, Bone, Ear, Move, CalendarCheck } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiMedicalNotice } from '../../shared/ui/medical-notice/medical-notice';
import { BabyVisual } from '../../shared/illustrations/baby-visual/baby-visual';
import { PregnancyService } from '../../core/services/pregnancy.service';
import { babyComparisonForWeek, babyLengthForWeek, babyWeightForWeek, babyLengthLabelForWeek, devPointsForWeek } from '../../core/data/baby-growth';
import { PREGNANCY_MILESTONES, milestoneStatus, MilestoneStatus } from '../../core/data/milestones';
import { NUTRITION_GUIDE } from '../../core/data/nutrition-guide';
import { mesecZaNedelju, opsegMeseca } from '../../core/data/mesec-trudnoce';
import { PitanjaLekarService } from '../../core/services/pitanja-lekar.service';
import { UiButton } from '../../shared/ui/button/button';

const DEV_ICONS: Record<string, any> = { brain: Brain, bone: Bone, ear: Ear, move: Move };

@Component({
  selector: 'app-baby-development',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCard, BabyVisual, UiMedicalNotice, UiButton],
  templateUrl: './baby-development.html',
  styleUrl: './baby-development.scss'
})
export class BabyDevelopment {
  readonly weeks = Array.from({ length: 39 }, (_, i) => i + 4); // 4..42

  readonly selectedWeek = signal(this.weeks[0]);

  /** Postaje tačno kad korisnica sama izabere nedelju — od tada je ne pomeramo. */
  private rucnoIzabrana = false;

  constructor(readonly pregnancy: PregnancyService, readonly pitanjaSvc: PitanjaLekarService) {
    // Podaci o trudnoći se učitavaju asinhrono, pa u trenutku pravljenja
    // komponente weekNumber() još ume da bude 0. Zato se nedelja postavlja
    // kroz effect, čim stigne prava vrednost.
    effect(() => {
      const w = this.pregnancy.weekNumber();
      if (this.rucnoIzabrana || !w) return;
      this.selectedWeek.set(this.uOpsegu(w));
    });

    effect(() => {
      const p = this.pregnancy.active();
      if (p) this.pitanjaSvc.loadAll(p.id);
    });
  }

  /** Lista ide od 4. do 42. nedelje; van toga se hvatamo za najbliži kraj. */
  private uOpsegu(w: number): number {
    return Math.min(Math.max(w, this.weeks[0]), this.weeks[this.weeks.length - 1]);
  }

  get devPoints() {
    return devPointsForWeek(this.selectedWeek()).map(p => ({ icon: DEV_ICONS[p.icon], text: p.text }));
  }

  /** Prati izabranu nedelju, ne trenutnu — traka se koristi za listanje unapred. */
  get mesec(): number {
    return mesecZaNedelju(this.selectedWeek());
  }

  get opsegMeseca() {
    return opsegMeseca(this.mesec);
  }

  novoPitanje = '';
  readonly izmenaId = signal<string | null>(null);
  izmenaTekst = '';

  /**
   * Predlozi su tu samo kao podsticaj — jedan klik ih prepiše u polje, gde se
   * mogu izmeniti pre čuvanja. Ranije su bili jedini sadržaj, i to zakucan.
   */
  readonly predlozi = [
    'Da li su pokreti bebe u ovoj nedelji uobičajeni?',
    'Na šta treba posebno da obratim pažnju do sledećeg pregleda?',
    'Koje analize treba da uradim pre sledeće posete?',
    'Da li smem da nastavim sa terapijom koju pijem?',
  ];

  uzmiPredlog(tekst: string) {
    this.novoPitanje = tekst;
  }

  async dodajPitanje() {
    const p = this.pregnancy.active();
    const tekst = this.novoPitanje.trim();
    if (!p || !tekst) return;
    await this.pitanjaSvc.dodaj(p.id, tekst);
    this.novoPitanje = '';
  }

  pocniIzmenu(id: string, tekst: string) {
    this.izmenaId.set(id);
    this.izmenaTekst = tekst;
  }

  otkaziIzmenu() {
    this.izmenaId.set(null);
    this.izmenaTekst = '';
  }

  async sacuvajIzmenu() {
    const id = this.izmenaId();
    const tekst = this.izmenaTekst.trim();
    if (!id || !tekst) return;
    await this.pitanjaSvc.izmeni(id, tekst);
    this.otkaziIzmenu();
  }

  get isCurrentWeek(): boolean {
    // Poredi se sa nedeljom svedenom na opseg trake (4–42). Bez toga bi
    // trudnici u 3. nedelji stajalo dugme „vrati me na moju 3. nedelju", koje
    // ne bi imalo gde da je vrati — traka tu nedelju uopšte nema.
    return this.selectedWeek() === this.uOpsegu(this.pregnancy.weekNumber());
  }

  get currentWeekDay(): number {
    return this.pregnancy.weekDay();
  }

  get sizeLabel(): string {
    return babyComparisonForWeek(this.selectedWeek());
  }

  get length(): number {
    return babyLengthForWeek(this.selectedWeek());
  }

  get weight(): string {
    const g = babyWeightForWeek(this.selectedWeek());
    return g < 1 ? 'manje od 1' : String(g);
  }

  get lengthLabel(): string {
    return babyLengthLabelForWeek(this.selectedWeek());
  }

  selectWeek(w: number) {
    this.rucnoIzabrana = true;
    this.selectedWeek.set(w);
  }

  /** Vraća prikaz na nedelju u kojoj je trudnica. */
  nazadNaMoju() {
    this.rucnoIzabrana = false;
    this.selectedWeek.set(this.uOpsegu(this.pregnancy.weekNumber()));
  }

  readonly milestones = PREGNANCY_MILESTONES;
  readonly nutritionGuide = NUTRITION_GUIDE;

  statusFor(week: number): MilestoneStatus {
    return milestoneStatus(week, this.pregnancy.weekNumber());
  }

  readonly CheckIcon = Check;
  readonly CalendarCheckIcon = CalendarCheck;
}
