import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';
import { polPoTablici, NAJMANJA_STAROST, NAJVECA_STAROST } from '../../../core/data/zabava';

@Component({
  selector: 'app-pol-bebe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCard, UiButton],
  templateUrl: './pol-bebe.html',
  styleUrls: ['../javno.scss', './pol-bebe.scss']
})
export class PolBebe implements OnInit {
  private seo = inject(SeoService);

  starost: number | null = null;
  mesec: number | null = null;

  readonly meseci = [
    'januar', 'februar', 'mart', 'april', 'maj', 'jun',
    'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar',
  ].map((naziv, i) => ({ naziv, broj: i + 1 }));

  readonly rezultat = signal<'muško' | 'žensko' | null>(null);
  readonly greska = signal('');

  readonly najmanja = NAJMANJA_STAROST;
  readonly najveca = NAJVECA_STAROST;

  ngOnInit() {
    this.seo.postavi(
      'Kinesko računanje pola bebe',
      'Stara kineska tablica koja iz godina majke i meseca začeća pogađa pol bebe. Zabava, ne metod — tačnost je kao kod bacanja novčića.',
      '/pol-bebe',
    );
    this.seo.strukturirano([
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Zabava', putanja: '/zabava' },
        { naziv: 'Kinesko računanje pola', putanja: '/pol-bebe' },
      ]),
    ]);
  }

  izracunaj() {
    if (this.starost === null || this.mesec === null) {
      this.greska.set('Izaberi i godine i mesec začeća.');
      this.rezultat.set(null);
      return;
    }

    if (this.starost < NAJMANJA_STAROST || this.starost > NAJVECA_STAROST) {
      this.greska.set(`Tablica pokriva samo uzrast od ${NAJMANJA_STAROST} do ${NAJVECA_STAROST} godina.`);
      this.rezultat.set(null);
      return;
    }

    this.greska.set('');
    this.rezultat.set(polPoTablici(this.starost, this.mesec));
  }

  ponovo() {
    this.rezultat.set(null);
    this.greska.set('');
  }
}
