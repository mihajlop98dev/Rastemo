import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
  username = '';
  email = '';
  password = '';
  acceptedTerms = false;

  /** Provera zauzetosti dok korisnica kuca, da ne sazna tek pri slanju. */
  readonly stanjeImena = signal<'prazno' | 'proveravam' | 'slobodno' | 'zauzeto'>('prazno');
  private tajmerProvere?: ReturnType<typeof setTimeout>;

  readonly loading = signal(false);
  readonly error = signal('');

  readonly HeartIcon = Heart;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    seo: SeoService,
  ) {
    // Ekran nema šta da ponudi nekome ko dolazi sa pretraživača.
    seo.bezIndeksiranja('Otvori nalog');
  }

  /** Predlaže korisničko ime iz imena, da polje ne bude prazan zadatak. */
  predloziIme() {
    if (this.username || !this.fullName.trim()) return;
    const osnova = this.fullName.trim().toLowerCase()
      .replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj')
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 14);
    if (osnova.length >= 3) {
      this.username = osnova;
      this.proveriIme();
    }
  }

  proveriIme() {
    clearTimeout(this.tajmerProvere);
    const ime = this.username.trim();
    if (ime.length < 3) {
      this.stanjeImena.set('prazno');
      return;
    }
    this.stanjeImena.set('proveravam');
    // Kratka pauza da se ne šalje upit na svaki pritisak tastera.
    this.tajmerProvere = setTimeout(async () => {
      const slobodno = await this.auth.korisnickoImeSlobodno(ime);
      this.stanjeImena.set(slobodno ? 'slobodno' : 'zauzeto');
    }, 400);
  }

  async submit() {
    if (!this.fullName || !this.username || !this.email || !this.password) {
      this.error.set('Popuni sva polja.');
      return;
    }
    if (this.stanjeImena() === 'zauzeto') {
      this.error.set('To korisničko ime je zauzeto ili nije dozvoljeno.');
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

    const { data, error } = await this.auth.signUp(this.email, this.password, this.fullName, this.username.trim());
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
    // Isti povratak kao kod prijave: ko je krenuo sa foruma, vraća se tamo.
    const { error } = await this.auth.signInWithGoogle(
      this.route.snapshot.queryParamMap.get('nazad'),
    );
    if (error) this.error.set(error.message);
  }
}
