import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Heart } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../vodic/seo.service';

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
    seo: SeoService,
  ) {
    // Ekran nema šta da ponudi nekome ko dolazi sa pretraživača.
    seo.bezIndeksiranja('Otvori nalog');
  }

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

    const { data, error } = await this.auth.signUp(this.email, this.password, this.fullName);
    this.loading.set(false);

    if (error) {
      this.error.set(
        error.message.toLowerCase().includes('already registered')
          ? 'Nalog sa ovom adresom već postoji. Prijavi se ili zatraži novu lozinku.'
          : error.message
      );
      return;
    }

    // Sa uključenom potvrdom mejla signUp ne vraća sesiju — korisnica nije
    // prijavljena dok ne klikne na link. Prihvatanje uslova je poslato kroz
    // metapodatke i upisuje ga okidač u bazi.
    if (!data.session) {
      this.router.navigate(['/proveri-mejl'], { queryParams: { email: this.email } });
      return;
    }

    // Ako je potvrda mejla isključena, tok ostaje kao ranije.
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
