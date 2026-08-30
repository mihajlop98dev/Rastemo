import { Component, inject, signal, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiButton } from '../ui/button/button';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

/**
 * Traži korisničko ime pre prvog pisanja na forumu.
 *
 * Nalozi napravljeni pre uvođenja korisničkog imena, i oni preko Google
 * prijave, nemaju ga — a bez njega se na forumu ne bi imala čime potpisati.
 * Pita se ovde, a ne pri prijavi: ko aplikaciju koristi samo kao dnevnik i
 * nikad ne ode na forum, nema razloga da ga zaustavljamo na ulazu.
 */
@Component({
  selector: 'app-trazi-korisnicko',
  standalone: true,
  imports: [CommonModule, FormsModule, UiButton],
  templateUrl: './trazi-korisnicko.html',
  styleUrl: './trazi-korisnicko.scss',
})
export class TraziKorisnicko implements OnInit {
  private auth = inject(AuthService);
  private profileSvc = inject(ProfileService);

  readonly gotovo = output<void>();
  readonly odustala = output<void>();

  ime = '';
  readonly stanje = signal<'prazno' | 'proveravam' | 'slobodno' | 'zauzeto'>('prazno');
  readonly cuvam = signal(false);
  readonly greska = signal('');
  private tajmer?: ReturnType<typeof setTimeout>;

  /**
   * Predlaže ime iz profila, da polje ne bude prazan zadatak.
   *
   * Namerno iz imena, a ne iz mejla: „marija.petrovic@gmail.com" bi dao
   * potpis od kog se pola adrese vidi na javnom forumu. Ako se predlog već
   * koristi, dodaje se broj.
   */
  async ngOnInit() {
    const puno = (this.profileSvc.profile()?.full_name ?? '').trim();
    if (!puno) return;

    const osnova = puno.split(/\s+/)[0].toLowerCase()
      .replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 16);
    if (osnova.length < 3) return;

    for (const sufiks of ['', '1', '2', '3', '87', '99']) {
      const kandidat = osnova + sufiks;
      if (await this.auth.korisnickoImeSlobodno(kandidat)) {
        this.ime = kandidat;
        this.stanje.set('slobodno');
        return;
      }
    }
  }

  proveri() {
    clearTimeout(this.tajmer);
    this.greska.set('');
    const i = this.ime.trim();
    if (i.length < 3) {
      this.stanje.set('prazno');
      return;
    }
    this.stanje.set('proveravam');
    this.tajmer = setTimeout(async () => {
      const slobodno = await this.auth.korisnickoImeSlobodno(i);
      this.stanje.set(slobodno ? 'slobodno' : 'zauzeto');
    }, 400);
  }

  async sacuvaj() {
    if (this.stanje() !== 'slobodno') return;
    this.cuvam.set(true);
    this.greska.set('');
    try {
      await this.profileSvc.update({ username: this.ime.trim() });
      this.gotovo.emit();
    } catch (e) {
      // Poruka iz okidača u bazi tačno kaže šta ne valja sa imenom.
      this.greska.set((e as { message?: string }).message || 'Nije uspelo. Probaj ponovo.');
    } finally {
      this.cuvam.set(false);
    }
  }
}
