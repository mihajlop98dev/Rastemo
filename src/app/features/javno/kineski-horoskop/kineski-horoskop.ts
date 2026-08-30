import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';
import { KINESKI_ZNACI, KineskiZnak, kineskiZnakZaDatum, KINESKA_NOVA_GODINA } from '../../../core/data/zabava';
import { datumURecenici } from '../../../core/data/lokalizacija';

@Component({
  selector: 'app-kineski-horoskop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCard, UiButton],
  templateUrl: './kineski-horoskop.html',
  styleUrls: ['../javno.scss', './kineski-horoskop.scss']
})
export class KineskiHoroskop implements OnInit {
  private seo = inject(SeoService);

  datum = '';

  readonly rezultat = signal<{
    znak: KineskiZnak;
    godina: number;
    /** Popunjeno samo kad je datum toliko blizu granice da znak nije izvestan. */
    granica: { datum: string; drugiZnak: KineskiZnak; preGranice: boolean } | null;
  } | null>(null);
  readonly greska = signal('');
  readonly sviZnaci = KINESKI_ZNACI;

  ngOnInit() {
    this.seo.postavi(
      'Kineski horoskop za bebu i trudnoću',
      'Kineski horoskop: koji je znak tvoje bebe po terminu porođaja, i zašto kineska godina ne počinje prvog januara.',
      '/kineski-horoskop',
    );
    this.seo.strukturirano([
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Zabava', putanja: '/zabava' },
        { naziv: 'Kineski horoskop', putanja: '/kineski-horoskop' },
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

    const nadjeno = kineskiZnakZaDatum(d);
    if (!nadjeno) {
      const godine = Object.keys(KINESKA_NOVA_GODINA);
      this.greska.set(`Imamo datume kineske Nove godine za period ${godine[0]}–${godine[godine.length - 1]}.`);
      this.rezultat.set(null);
      return;
    }

    this.greska.set('');
    this.rezultat.set({ ...nadjeno, granica: this.granicaZa(d, nadjeno.znak) });
  }

  /**
   * Blizu kineske Nove godine znak nije izvestan, jer je termin samo procena.
   * Bitno je koju granicu datum dodiruje — onu koju je upravo prešao ili onu
   * koja tek dolazi — inače poruka govori o datumu udaljenom skoro godinu dana.
   */
  private granicaZa(d: Date, znak: KineskiZnak) {
    const BLIZU_DANA = 20;
    const nova = KINESKA_NOVA_GODINA[d.getFullYear()];
    if (!nova) return null;

    const granica = new Date(nova + 'T00:00:00');
    const razlika = (d.getTime() - granica.getTime()) / 86400000;
    if (Math.abs(razlika) > BLIZU_DANA) return null;

    const i = KINESKI_ZNACI.indexOf(znak);
    const preGranice = razlika < 0;
    const drugiZnak = KINESKI_ZNACI[(i + (preGranice ? 1 : 11)) % 12];

    return { datum: this.formatiraj(granica), drugiZnak, preGranice };
  }

  private formatiraj(d: Date): string {
    return datumURecenici(d);
  }

  ponovo() {
    this.rezultat.set(null);
    this.greska.set('');
  }
}
