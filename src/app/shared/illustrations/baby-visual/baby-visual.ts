import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Licensed illustration set (Vecteezy) covering six stages of development.
 * Each entry claims every week from `fromWeek` up to the next entry's.
 */
const STAGES: { fromWeek: number; src: string }[] = [
  { fromWeek: 0, src: 'womb-stage-1.png' },
  { fromWeek: 8, src: 'womb-stage-2.png' },
  { fromWeek: 12, src: 'womb-stage-3.png' },
  { fromWeek: 16, src: 'womb-stage-4.png' },
  { fromWeek: 24, src: 'womb-stage-5.png' },
  { fromWeek: 32, src: 'womb-stage-6.png' },
];

@Component({
  selector: 'app-baby-visual',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './baby-visual.html',
  styleUrl: './baby-visual.scss'
})
export class BabyVisual {
  /** Pregnancy week, 4–40. Picks which stage illustration to show. */
  @Input() week = 21;
  @Input() size: 'sm' | 'md' | 'lg' = 'lg';

  get src(): string {
    let chosen = STAGES[0];
    for (const stage of STAGES) {
      if (this.week >= stage.fromWeek) chosen = stage;
    }
    return `/illustrations/${chosen.src}`;
  }

  /**
   * Gentle extra growth *within* a stage, so weeks between two illustrations
   * still read as progress rather than a static image.
   */
  get scale(): number {
    const index = STAGES.findIndex(s => s.src === this.src.split('/').pop());
    const start = STAGES[index].fromWeek;
    const end = index + 1 < STAGES.length ? STAGES[index + 1].fromWeek : 41;
    const t = Math.min(Math.max((this.week - start) / (end - start), 0), 1);
    return 0.92 + t * 0.08;
  }
}
