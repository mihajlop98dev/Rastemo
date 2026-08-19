import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check, Brain, Bone, Ear, Move, CalendarCheck } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiMedicalNotice } from '../../shared/ui/medical-notice/medical-notice';
import { BabyVisual } from '../../shared/illustrations/baby-visual/baby-visual';
import { PregnancyService } from '../../core/services/pregnancy.service';
import { babyComparisonForWeek, babyLengthForWeek, babyWeightForWeek, babyLengthLabelForWeek, devPointsForWeek } from '../../core/data/baby-growth';
import { PREGNANCY_MILESTONES, milestoneStatus, MilestoneStatus } from '../../core/data/milestones';
import { NUTRITION_GUIDE } from '../../core/data/nutrition-guide';

const DEV_ICONS: Record<string, any> = { brain: Brain, bone: Bone, ear: Ear, move: Move };

@Component({
  selector: 'app-baby-development',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, BabyVisual, UiMedicalNotice],
  templateUrl: './baby-development.html',
  styleUrl: './baby-development.scss'
})
export class BabyDevelopment {
  readonly weeks = Array.from({ length: 39 }, (_, i) => i + 4); // 4..42

  readonly selectedWeek = signal(this.weeks[0]);

  /** Postaje tačno kad korisnica sama izabere nedelju — od tada je ne pomeramo. */
  private rucnoIzabrana = false;

  constructor(readonly pregnancy: PregnancyService) {
    // Podaci o trudnoći se učitavaju asinhrono, pa u trenutku pravljenja
    // komponente weekNumber() još ume da bude 0. Zato se nedelja postavlja
    // kroz effect, čim stigne prava vrednost.
    effect(() => {
      const w = this.pregnancy.weekNumber();
      if (this.rucnoIzabrana || !w) return;
      this.selectedWeek.set(this.uOpsegu(w));
    });
  }

  /** Lista ide od 4. do 42. nedelje; van toga se hvatamo za najbliži kraj. */
  private uOpsegu(w: number): number {
    return Math.min(Math.max(w, this.weeks[0]), this.weeks[this.weeks.length - 1]);
  }

  get devPoints() {
    return devPointsForWeek(this.selectedWeek()).map(p => ({ icon: DEV_ICONS[p.icon], text: p.text }));
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
