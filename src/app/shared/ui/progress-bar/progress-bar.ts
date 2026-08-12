import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ui-progress" [ngClass]="'ui-progress--' + tone">
      <div class="ui-progress__fill" [style.width.%]="value"></div>
      <div *ngIf="marker !== undefined" class="ui-progress__marker" [style.left.%]="marker"></div>
    </div>
  `,
  styleUrl: './progress-bar.scss'
})
export class UiProgressBar {
  @Input() value = 0;
  @Input() marker?: number;
  @Input() tone: 'primary' | 'peach' | 'sage' = 'primary';
}
