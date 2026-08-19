import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Heart, KeyRound } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiButton],
  templateUrl: './forgot-password.html',
  styleUrl: '../register/register.scss'
})
export class ForgotPassword {
  email = '';
  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly error = signal('');

  readonly HeartIcon = Heart;
  readonly KeyIcon = KeyRound;

  constructor(private auth: AuthService) {}

  async submit() {
    if (!this.email.trim()) {
      this.error.set('Upiši svoju email adresu.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    const { error } = await this.auth.sendPasswordReset(this.email.trim());
    this.loading.set(false);

    if (error && error.message.toLowerCase().includes('rate')) {
      this.error.set('Mejl je već poslat pre koji trenutak. Sačekaj minut pa pokušaj ponovo.');
      return;
    }

    // Namerno se ne razlikuje postojeći od nepostojećeg naloga: kad bi poruka
    // bila različita, svako bi mogao da proveri da li je neka adresa registrovana.
    this.sent.set(true);
  }
}
