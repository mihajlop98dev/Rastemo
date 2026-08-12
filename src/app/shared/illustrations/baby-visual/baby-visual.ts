import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-baby-visual',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './baby-visual.html',
  styleUrl: './baby-visual.scss'
})
export class BabyVisual {
  /** Pregnancy week, 4–40. Drives silhouette scale so the visual grows across the timeline. */
  @Input() week = 21;
  @Input() size: 'sm' | 'md' | 'lg' = 'lg';

  get scale(): number {
    const t = Math.min(Math.max((this.week - 8) / (38 - 8), 0), 1);
    return 0.52 + t * 0.48;
  }
}
