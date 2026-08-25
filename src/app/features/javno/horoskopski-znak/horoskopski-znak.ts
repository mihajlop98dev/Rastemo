import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';
import { ZNACI, Znak, znakZaDatum } from '../../../core/data/zabava';
import { LOKAL } from '../../../core/data/lokalizacija';

@Component({
  selector: 'app-horoskopski-znak',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCard, UiButton],
  templateUrl: './horoskopski-znak.html',
  styleUrls: ['../javno.scss', '../kineski-horoskop/kineski-horoskop.scss']
})
export class HoroskopskiZnak implements OnInit {
  private seo = inject(SeoService);

  datum = '';

  readonly rezultat = signal<{ znak: Znak; naGranici: Znak | null } | null>(null);
  readonly greska = signal('');
  readonly sviZnaci = ZNACI;

  ngOnInit() {
    this.seo.postavi(
      'Horoskopski znak bebe',
      'Koji će horoskopski znak imati beba po terminu porođaja, sa datumima svih dvanaest znakova i odakle im imena.',
      '/horoskopski-znak',
    );
    this.seo.strukturirano([
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Zabava', putanja: '/zabava' },
        { naziv: 'Horoskopski znak', putanja: '/horoskopski-znak' },
      ]),
    ]);
  }

  izracunaj() {
    if (!this.datum) {
      this.greska.set('Upiši termin ili datum rođenja.');
      return;
    }

    const d = new Date(this.datum + 'T00:00:00');
    if (Number.isNaN(d.getTime())) {
      this.greska.set('Datum nije ispravan.');
      return;
    }

    const znak = znakZaDatum(d);

    // Termin je procena, a ne datum. Ako pada u prva ili poslednja tri dana
    // znaka, sasvim je izgledno da će beba biti u susednom.
    const dan = 86400000;
    const susedni = znakZaDatum(new Date(d.getTime() + 3 * dan));
    const raniji = znakZaDatum(new Date(d.getTime() - 3 * dan));
    const drugi = susedni.naziv !== znak.naziv ? susedni : raniji.naziv !== znak.naziv ? raniji : null;

    this.greska.set('');
    this.rezultat.set({ znak, naGranici: drugi });
  }

  ponovo() {
    this.rezultat.set(null);
    this.greska.set('');
  }

  opseg(z: Znak): string {
    const ime = (m: number) => new Date(2025, m - 1, 1).toLocaleDateString(LOKAL, { month: 'long' });
    return `${z.od[1]}. ${ime(z.od[0])} — ${z.do[1]}. ${ime(z.do[0])}`;
  }
}
