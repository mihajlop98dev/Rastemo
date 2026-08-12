import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UiTabItem {
  id: string;
  label: string;
  count?: number;
}

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ui-tabs">
      <button
        *ngFor="let tab of tabs"
        class="ui-tabs__item"
        [class.ui-tabs__item--active]="tab.id === active"
        (click)="activeChange.emit(tab.id)">
        {{ tab.label }}
        <span *ngIf="tab.count !== undefined" class="ui-tabs__count">{{ tab.count }}</span>
      </button>
    </div>
  `,
  styleUrl: './tabs.scss'
})
export class UiTabs {
  @Input() tabs: UiTabItem[] = [];
  @Input() active = '';
  @Output() activeChange = new EventEmitter<string>();
}
