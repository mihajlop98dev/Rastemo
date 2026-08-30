import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Heart } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';
import { SeoService } from '../../vodic/seo.service';

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

  /** Prosleđuje se registraciji, da i posle nje povratak radi. */
  get nazadUrl(): string | null {
    return this.route.snapshot.queryParamMap.get('nazad');
  }

  constructor(
    private auth: AuthService,
    private admin: AdminService,
    private router: Router,
    private route: ActivatedRoute,
    seo: SeoService,
  ) {
    // Ekran nema šta da ponudi nekome ko dolazi sa pretraživača.
    seo.bezIndeksiranja('Prijava');
  }

  async submit() {
    if (!this.email || !this.password) {
      this.error.set('Unesi email ili korisničko ime i lozinku.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const { error } = await this.auth.prijaviSe(this.email, this.password);

    this.loading.set(false);

    if (error) {
      this.error.set('Pogrešan email ili lozinka.');
      return;
    }

    // Ako je stigla sa foruma, vraća se tačno na temu koju je čitala —
    // inače bi završila na Početnoj i izgubila je.
    const nazad = this.route.snapshot.queryParamMap.get('nazad');
    if (nazad && nazad.startsWith('/') && !nazad.startsWith('//')) {
      this.router.navigateByUrl(nazad);
      return;
    }

    this.router.navigateByUrl(await this.admin.checkAdmin() ? '/admin' : '/home');
  }

  async withGoogle() {
    this.error.set('');
    const { error } = await this.auth.signInWithGoogle(this.nazadUrl);
    if (error) this.error.set(error.message);
  }
}
