import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ui-card" [ngClass]="['ui-card--' + padding, flat ? 'ui-card--flat' : '']">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './card.scss'
})
export class UiCard {
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() flat = false;
}
