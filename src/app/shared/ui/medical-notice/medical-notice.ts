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
    <details class="medical-notice-tiho" *ngIf="tiho; else puno">
      <summary>Kada se odmah javiti lekaru?</summary>
      <p>
        Ako primetiš krvarenje, jak bol u stomaku, curenje plodove vode ili da se
        beba primetno manje pomera — ne čekaj, javi se lekaru ili pozovi 194.
        Sadržaj u Dnevniku je informativan i ne zamenjuje pregled.
      </p>
    </details>
    <ng-template #puno>
    <div class="medical-notice" [class.medical-notice--compact]="compact">
      <span class="medical-notice__icon">
        <lucide-icon [img]="InfoIcon" [size]="15"></lucide-icon>
      </span>
      <p>
        {{ text }}
        <a routerLink="/uslovi-koriscenja" *ngIf="!compact">Uslovi korišćenja</a>
      </p>
    </div>
    </ng-template>
  `,
  styleUrl: './medical-notice.scss'
})
export class UiMedicalNotice {
  @Input() text =
    'Sadržaj u aplikaciji je informativnog karaktera i ne zamenjuje savet lekara. ' +
    'Za svaku odluku o svom zdravlju obrati se svom ginekologu.';
  @Input() compact = false;
  /**
   * Tihi oblik: jedan red na dnu ekrana koji se otvara na dodir.
   * Upozorenje o krvarenju na vrhu svakog ekrana prvo je što trudnica vidi —
   * plaši i odbija. Informacija mora da postoji, ali ne da viče.
   */
  @Input() tiho = false;

  readonly InfoIcon = Info;
}
