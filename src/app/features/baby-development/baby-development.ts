import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check, Brain, Bone, Ear, Move } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { BabyVisual } from '../../shared/illustrations/baby-visual/baby-visual';
import { currentUser } from '../../core/data/mock-data';

interface WeekDevPoint {
  icon: any;
  text: string;
}

@Component({
  selector: 'app-baby-development',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, BabyVisual],
  templateUrl: './baby-development.html',
  styleUrl: './baby-development.scss'
})
export class BabyDevelopment {
  readonly weeks = Array.from({ length: 33 }, (_, i) => i + 8); // 8..40
  selectedWeek = currentUser.weekNumber;

  readonly comparisons: Record<number, string> = {
    8: 'malina', 12: 'kajsija', 16: 'avokado', 20: 'banana',
    21: 'nara', 24: 'kukuruza', 28: 'patlidžana', 32: 'kokosa',
    36: 'zelene salate', 40: 'lubenice',
  };

  readonly devPoints: WeekDevPoint[] = [
    { icon: Brain, text: 'Razvoj mozga i nervnog sistema napreduje ubrzano.' },
    { icon: Bone, text: 'Kosti i mišići postaju sve jači i izraženiji.' },
    { icon: Ear, text: 'Beba počinje da razaznaje zvukove iz okruženja.' },
    { icon: Move, text: 'Sve više prostora za pokrete, protezanje i štucanje.' },
  ];

  get sizeLabel(): string {
    const idx = this.weeks.indexOf(this.selectedWeek);
    const keys = Object.keys(this.comparisons).map(Number).sort((a, b) => a - b);
    let closest = keys[0];
    for (const k of keys) if (this.selectedWeek >= k) closest = k;
    return this.comparisons[closest];
  }

  get length(): number {
    return Math.round((7 + (this.selectedWeek - 8) * 1.55) * 10) / 10;
  }

  get weight(): number {
    const t = (this.selectedWeek - 8) / (40 - 8);
    return Math.round(5 + t * t * 3350);
  }

  selectWeek(w: number) { this.selectedWeek = w; }

  readonly CheckIcon = Check;
}
