import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ui-avatar" [ngClass]="'ui-avatar--' + size" [style.background]="src ? 'transparent' : bgColor">
      <img *ngIf="src" [src]="src" [alt]="name" />
      <span *ngIf="!src">{{ initials }}</span>
    </div>
  `,
  styleUrl: './avatar.scss'
})
export class UiAvatar {
  @Input() src?: string;
  @Input() name = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';

  private readonly palette = ['#F8DDE3', '#FBE5D8', '#EEE7F7', '#E5EEE1', '#FBEDD3'];

  get initials(): string {
    return this.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase())
      .join('');
  }

  get bgColor(): string {
    const idx = this.name.length % this.palette.length;
    return this.palette[idx] || this.palette[0];
  }
}
