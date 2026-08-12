import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeTone = 'primary' | 'peach' | 'lavender' | 'sage' | 'gold' | 'neutral' | 'danger';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="ui-badge" [ngClass]="'ui-badge--' + tone">
      <ng-content></ng-content>
    </span>
  `,
  styleUrl: './badge.scss'
})
export class UiBadge {
  @Input() tone: BadgeTone = 'primary';
}
