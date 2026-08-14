import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check, Brain, Bone, Ear, Move, CalendarCheck } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { BabyVisual } from '../../shared/illustrations/baby-visual/baby-visual';
import { PregnancyService } from '../../core/services/pregnancy.service';
import { babyComparisonForWeek, babyLengthForWeek, babyWeightForWeek, devPointsForWeek } from '../../core/data/baby-growth';
import { PREGNANCY_MILESTONES, milestoneStatus, MilestoneStatus } from '../../core/data/milestones';
import { NUTRITION_GUIDE } from '../../core/data/nutrition-guide';

const DEV_ICONS: Record<string, any> = { brain: Brain, bone: Bone, ear: Ear, move: Move };

@Component({
  selector: 'app-baby-development',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, BabyVisual],
  templateUrl: './baby-development.html',
  styleUrl: './baby-development.scss'
})
export class BabyDevelopment {
  readonly weeks = Array.from({ length: 33 }, (_, i) => i + 8); // 8..40
  selectedWeek: number;

  constructor(private pregnancy: PregnancyService) {
    this.selectedWeek = Math.min(Math.max(pregnancy.weekNumber(), 8), 40);
  }

  get devPoints() {
    return devPointsForWeek(this.selectedWeek).map(p => ({ icon: DEV_ICONS[p.icon], text: p.text }));
  }

  get isCurrentWeek(): boolean {
    return this.selectedWeek === this.pregnancy.weekNumber();
  }

  get currentWeekDay(): number {
    return this.pregnancy.weekDay();
  }

  get sizeLabel(): string {
    return babyComparisonForWeek(this.selectedWeek);
  }

  get length(): number {
    return babyLengthForWeek(this.selectedWeek);
  }

  get weight(): number {
    return babyWeightForWeek(this.selectedWeek);
  }

  selectWeek(w: number) { this.selectedWeek = w; }

  readonly milestones = PREGNANCY_MILESTONES;
  readonly nutritionGuide = NUTRITION_GUIDE;

  statusFor(week: number): MilestoneStatus {
    return milestoneStatus(week, this.pregnancy.weekNumber());
  }

  readonly CheckIcon = Check;
  readonly CalendarCheckIcon = CalendarCheck;
}
