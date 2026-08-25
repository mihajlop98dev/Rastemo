import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButton } from '../ui/button/button';
import { PushService } from '../../core/services/push.service';

/**
 * Poziv da se uključe notifikacije.
 *
 * Pokazuje se tek kad za to postoji povod — pošto je zakazan pregled — a ne
 * pri prvom otvaranju aplikacije. Ko odbije na iPhone-u, dozvolu posle mora
 * da traži kroz podešavanja telefona; aplikacija ne sme ponovo da pita.
 *
 * Na iPhone-u Push API u Safari tabu ne postoji, pa se prvo mora dodati
 * prečica na početni ekran. Zato taj slučaj dobija uputstvo, a ne dugme.
 */
@Component({
  selector: 'app-push-poziv',
  standalone: true,
  imports: [CommonModule, UiButton],
  templateUrl: './push-poziv.html',
  styleUrl: './push-poziv.scss',
})
export class PushPoziv {
  readonly push = inject(PushService);
  readonly zatvoreno = output<void>();

  readonly gotovo = signal(false);
  readonly odbijeno = signal(false);

  async ukljuci() {
    const stanje = await this.push.ukljuci();
    if (stanje === 'ukljuceno') this.gotovo.set(true);
    else if (stanje === 'odbijeno') this.odbijeno.set(true);
  }

  zatvori() {
    this.zatvoreno.emit();
  }
}
