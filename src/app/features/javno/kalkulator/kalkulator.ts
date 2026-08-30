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
  datumi: KljucniDatum[];
}

interface KljucniDatum {
  naziv: string;
  datum: Date;
  opis: string;
  proslo: boolean;
}

/**
 * Datumi koji se svi računaju iz istog unosa, a žene ih traže odvojeno:
 * kada je došlo do začeća, kada se čuje srce, kada se oseti prvi pokret.
 *
 * Nedelje su iz uobičajene akušerske prakse i namerno su date kao raspon
 * tamo gde raspon i postoji — prvi pokret se kod prve trudnoće oseti kasnije
 * nego kod druge, i tvrditi tačan dan bilo bi netačno.
 */
const KLJUCNE_NEDELJE: { nedelja: number; naziv: string; opis: string }[] = [
  { nedelja: 2, naziv: 'Začeće', opis: 'Otprilike dve nedelje posle početka poslednje menstruacije.' },
  { nedelja: 6, naziv: 'Prvi otkucaji srca', opis: 'Mogu da se vide na ultrazvuku, ponekad i nedelju dana kasnije.' },
  { nedelja: 12, naziv: 'Kraj prvog tromesečja', opis: 'Rizik od gubitka trudnoće znatno opada.' },
  { nedelja: 13, naziv: 'Prvi skrining', opis: 'Dabl test i merenje nuhalnog nabora rade se između 11. i 14. nedelje.' },
  { nedelja: 20, naziv: 'Pol bebe na ultrazvuku', opis: 'Obično se pouzdano vidi, ako beba zauzme povoljan položaj.' },
  { nedelja: 20, naziv: 'Prvi pokreti', opis: 'Kod prve trudnoće oko 20. nedelje, kod sledećih i ranije.' },
  { nedelja: 24, naziv: 'Granica održivosti', opis: 'Od ove nedelje beba ima šanse da preživi uz intenzivnu negu.' },
  { nedelja: 28, naziv: 'Kraj drugog tromesečja', opis: 'Počinje poslednja trećina trudnoće.' },
  { nedelja: 37, naziv: 'Trudnoća je donešena', opis: 'Od ove nedelje porođaj se više ne smatra prevremenim.' },
];

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
      'Kalkulator trudnoće i termina porođaja',
      'Kalkulator trudnoće: izračunaj termin porođaja i nedelju u kojoj si, po poslednjoj menstruaciji ili datumu začeća. Uz kalendar trudnoće po nedeljama.',
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
      datumi: this.kljucniDatumi(pocetak, danas),
    });
  }

  /** Svi ključni datumi se broje od prvog dana poslednje menstruacije. */
  private kljucniDatumi(pocetak: Date, danas: Date): KljucniDatum[] {
    // Kod poznatog začeća uneti datum je već 2. nedelja, pa se nulta tačka
    // pomera unazad da bi se svi ostali datumi poklopili.
    const nula = new Date(pocetak);
    if (this.nacin === 'zaceće') nula.setDate(nula.getDate() - 14);

    return KLJUCNE_NEDELJE.map(k => {
      const d = new Date(nula);
      d.setDate(d.getDate() + k.nedelja * 7);
      return { naziv: k.naziv, datum: d, opis: k.opis, proslo: d < danas };
    });
  }

  /** Kratak oblik za spisak datuma — pun datum bi tu bio preglasan. */
  formatirajKratko(d: Date): string {
    return d.toLocaleDateString(LOKAL, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatirajDatum(d: Date): string {
    return d.toLocaleDateString(LOKAL, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}
