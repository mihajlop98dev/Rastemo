import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Star } from 'lucide-angular';

@Component({
  selector: 'ui-rating',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <span class="ui-rating">
      <lucide-icon [img]="Star" [size]="14" class="ui-rating__star"></lucide-icon>
      <span class="ui-rating__value">{{ value.toFixed(1) }}</span>
      <span *ngIf="count !== undefined" class="ui-rating__count">({{ count }})</span>
    </span>
  `,
  styleUrl: './rating.scss'
})
export class UiRating {
  @Input() value = 0;
  @Input() count?: number;
  readonly Star = Star;
}
