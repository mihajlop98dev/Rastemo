import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';
import { LOKAL } from '../../../core/data/lokalizacija';

interface Rezultat {
  termin: Date;
  nedelja: number;
  dan: number;
  preostaloDana: number;
  trimestar: number;
}

@Component({
  selector: 'app-kalkulator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCard, UiButton],
  templateUrl: './kalkulator.html',
  styleUrls: ['../javno.scss', './kalkulator.scss']
})
export class Kalkulator implements OnInit {
  private seo = inject(SeoService);

  nacin: 'menstruacija' | 'zaceće' = 'menstruacija';
  datum = '';
  duzinaCiklusa = 28;

  readonly rezultat = signal<Rezultat | null>(null);
  readonly greska = signal('');

  ngOnInit() {
    this.seo.postavi(
      'Kalkulator termina porođaja',
      'Izračunaj termin porođaja i nedelju trudnoće na osnovu poslednje menstruacije ili datuma začeća. Besplatno, na srpskom.',
      '/kalkulator-termina',
    );

    this.seo.strukturirano([
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Kalkulator termina porođaja',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web',
        inLanguage: 'sr-Latn-RS',
        url: 'https://dnevniktrudnoce.com/kalkulator-termina',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'RSD' },
      },
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Kalkulator termina', putanja: '/kalkulator-termina' },
      ]),
    ]);
  }

  izracunaj() {
    if (!this.datum) {
      this.greska.set('Upiši datum.');
      return;
    }

    const pocetak = new Date(this.datum + 'T00:00:00');
    if (Number.isNaN(pocetak.getTime())) {
      this.greska.set('Datum nije ispravan.');
      return;
    }

    const danas = new Date();
    danas.setHours(0, 0, 0, 0);

    if (pocetak > danas) {
      this.greska.set('Datum je u budućnosti — proveri šta si upisala.');
      return;
    }

    // Naegeleovo pravilo: termin je 280 dana od prvog dana poslednje menstruacije.
    // Kod dužeg ili kraćeg ciklusa ovulacija ne pada na 14. dan, pa se razlika
    // dodaje na termin. Kod poznatog začeća računa se 266 dana.
    const dana = this.nacin === 'menstruacija'
      ? 280 + (this.duzinaCiklusa - 28)
      : 266;

    const termin = new Date(pocetak);
    termin.setDate(termin.getDate() + dana);

    const protekloDana = Math.floor((danas.getTime() - pocetak.getTime()) / 86400000)
      + (this.nacin === 'zaceće' ? 14 : 0);

    const nedelja = Math.floor(protekloDana / 7);
    if (nedelja > 45) {
      this.greska.set('Po tom datumu trudnoća bi bila duža od 45 nedelja — proveri unos.');
      return;
    }

    this.greska.set('');
    this.rezultat.set({
      termin,
      nedelja,
      dan: protekloDana % 7,
      preostaloDana: Math.max(0, Math.ceil((termin.getTime() - danas.getTime()) / 86400000)),
      trimestar: nedelja < 13 ? 1 : nedelja < 28 ? 2 : 3,
    });
  }

  formatirajDatum(d: Date): string {
    return d.toLocaleDateString(LOKAL, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}
