import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Info } from 'lucide-angular';

/**
 * Medicinsko upozorenje koje stoji na svakom ekranu sa zdravstvenim sadržajem.
 * Tekst se prosleđuje kroz `text` da bi svaki ekran mogao da bude konkretan —
 * generičko upozorenje korisnice prestanu da čitaju.
 */
@Component({
  selector: 'ui-medical-notice',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="medical-notice" [class.medical-notice--compact]="compact">
      <span class="medical-notice__icon">
        <lucide-icon [img]="InfoIcon" [size]="15"></lucide-icon>
      </span>
      <p>
        {{ text }}
        <a routerLink="/uslovi-koriscenja" *ngIf="!compact">Uslovi korišćenja</a>
      </p>
    </div>
  `,
  styleUrl: './medical-notice.scss'
})
export class UiMedicalNotice {
  @Input() text =
    'Sadržaj u aplikaciji je informativnog karaktera i ne zamenjuje savet lekara. ' +
    'Za svaku odluku o svom zdravlju obrati se svom ginekologu.';
  @Input() compact = false;

  readonly InfoIcon = Info;
}
