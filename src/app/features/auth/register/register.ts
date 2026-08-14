import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Heart } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiButton],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  fullName = '';
  email = '';
  password = '';
  acceptedTerms = false;

  readonly loading = signal(false);
  readonly error = signal('');

  readonly HeartIcon = Heart;

  constructor(
    private auth: AuthService,
    private router: Router,
    private profileSvc: ProfileService,
  ) {}

  async submit() {
    if (!this.fullName || !this.email || !this.password) {
      this.error.set('Popuni sva polja.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Lozinka mora imati bar 6 karaktera.');
      return;
    }
    if (!this.acceptedTerms) {
      this.error.set('Moraš prihvatiti Uslove korišćenja i Politiku privatnosti.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { error } = await this.auth.signUp(this.email, this.password, this.fullName);

    if (error) {
      this.loading.set(false);
      this.error.set(error.message);
      return;
    }

    // Profil pravi okidač u bazi tek po kreiranju naloga, pa se prihvatanje
    // upisuje odmah nakon uspešne registracije. Ako upis padne (npr. mreža),
    // registraciju ne rušimo — modal u Shell-u će tražiti prihvatanje ponovo.
    try {
      await this.profileSvc.acceptTerms();
    } catch {
      /* zanemari — gate u Shell-u hvata ovaj slučaj */
    }

    this.loading.set(false);
    this.router.navigateByUrl('/pregnancy-setup');
  }

  async withGoogle() {
    if (!this.acceptedTerms) {
      this.error.set('Moraš prihvatiti Uslove korišćenja i Politiku privatnosti.');
      return;
    }
    this.error.set('');
    const { error } = await this.auth.signInWithGoogle();
    if (error) this.error.set(error.message);
  }
}
