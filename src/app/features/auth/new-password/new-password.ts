import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Heart } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiButton],
  templateUrl: './new-password.html',
  styleUrl: '../register/register.scss'
})
export class NewPassword implements OnInit {
  password = '';
  confirm = '';

  readonly checking = signal(true);
  readonly validLink = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly HeartIcon = Heart;

  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Klik na link iz mejla vraća korisnicu ovde sa tokenom u adresi. supabase-js
   * ga sam pročita i uspostavi privremenu sesiju, ali to traje koji trenutak —
   * zato se čeka spremnost umesto da se sesija odmah čita.
   */
  async ngOnInit() {
    await this.auth.waitUntilReady();
    this.validLink.set(!!this.auth.session());
    this.checking.set(false);
  }

  async submit() {
    if (this.password.length < 6) {
      this.error.set('Lozinka mora imati bar 6 karaktera.');
      return;
    }
    if (this.password !== this.confirm) {
      this.error.set('Lozinke se ne poklapaju.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    const { error } = await this.auth.updatePassword(this.password);
    this.loading.set(false);

    if (error) {
      this.error.set(
        error.message.toLowerCase().includes('should be different')
          ? 'Nova lozinka mora da se razlikuje od stare.'
          : error.message
      );
      return;
    }

    this.router.navigateByUrl('/home');
  }
}
