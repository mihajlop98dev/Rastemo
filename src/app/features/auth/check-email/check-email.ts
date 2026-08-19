import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, Heart, MailCheck } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiButton],
  templateUrl: './check-email.html',
  styleUrl: '../register/register.scss'
})
export class CheckEmail {
  /** Adresa stiže iz registracije; bez nje se ponovno slanje ne nudi. */
  readonly email = signal('');
  readonly sending = signal(false);
  readonly sent = signal(false);
  readonly error = signal('');

  readonly HeartIcon = Heart;
  readonly MailIcon = MailCheck;

  constructor(route: ActivatedRoute, private auth: AuthService) {
    this.email.set(route.snapshot.queryParamMap.get('email') ?? '');
  }

  async resend() {
    const adresa = this.email();
    if (!adresa || this.sending()) return;

    this.sending.set(true);
    this.error.set('');
    const { error } = await this.auth.resendConfirmation(adresa);
    this.sending.set(false);

    if (error) {
      // Supabase ograničava učestalost slanja; poruka o tome je korisnija od šifre greške.
      this.error.set(
        error.message.toLowerCase().includes('rate')
          ? 'Mejl je već poslat pre koji trenutak. Sačekaj minut pa pokušaj ponovo.'
          : error.message
      );
      return;
    }
    this.sent.set(true);
  }
}
