import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Heart } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { AuthService } from '../../../core/services/auth.service';

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

  readonly loading = signal(false);
  readonly error = signal('');

  readonly HeartIcon = Heart;

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    if (!this.fullName || !this.email || !this.password) {
      this.error.set('Popuni sva polja.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Lozinka mora imati bar 6 karaktera.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { error } = await this.auth.signUp(this.email, this.password, this.fullName);

    this.loading.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    this.router.navigateByUrl('/podesavanje-trudnoce');
  }

  async withGoogle() {
    this.error.set('');
    const { error } = await this.auth.signInWithGoogle();
    if (error) this.error.set(error.message);
  }
}
