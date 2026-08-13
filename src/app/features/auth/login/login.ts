import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Heart } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiButton],
  templateUrl: './login.html',
  styleUrl: '../register/register.scss'
})
export class Login {
  email = '';
  password = '';

  readonly loading = signal(false);
  readonly error = signal('');

  readonly HeartIcon = Heart;

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    if (!this.email || !this.password) {
      this.error.set('Unesi email i lozinku.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { error } = await this.auth.signIn(this.email, this.password);

    this.loading.set(false);

    if (error) {
      this.error.set('Pogrešan email ili lozinka.');
      return;
    }

    this.router.navigateByUrl('/home');
  }

  async withGoogle() {
    this.error.set('');
    const { error } = await this.auth.signInWithGoogle();
    if (error) this.error.set(error.message);
  }
}
