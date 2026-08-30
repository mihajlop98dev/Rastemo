import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';
import { LOKAL } from '../../../core/data/lokalizacija';

interface Rezultat {
  zaceceOd: Date;
  zaceceDo: Date;
  najverovatnije: Date;
  poslednjaMenstruacija: Date;
  nedeljaSada: number;
}

/**
 * Računa unazad: iz termina ili trenutne nedelje dolazi do vremena začeća.
 *
 * Namerno vraća raspon, ne jedan dan. Ovulacija se ne dešava uvek na 14. dan,
 * a spermatozoidi žive do pet dana — tvrditi tačan datum začeća bilo bi
 * netačno i, kod pitanja očinstva, štetno.
 */
@Component({
  selector: 'app-kalkulator-zaceca',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCard, UiButton],
  templateUrl: './kalkulator-zaceca.html',
  styleUrls: ['../javno.scss', '../kalkulator/kalkulator.scss', './kalkulator-zaceca.scss'],
})
export class KalkulatorZaceca implements OnInit {
  private seo = inject(SeoService);

  nacin: 'termin' | 'nedelja' = 'termin';
  datumTermina = '';
  nedeljaSada: number | null = null;

  readonly rezultat = signal<Rezultat | null>(null);
  readonly greska = signal('');

  ngOnInit() {
    this.seo.postavi(
      'Kalkulator začeća — kada sam zatrudnela',
      'Izračunaj kada je došlo do začeća, na osnovu termina porođaja ili nedelje trudnoće u kojoj si sada. Uz objašnjenje zašto je to raspon, a ne jedan dan.',
      '/kalkulator-zaceca',
    );
    this.seo.strukturirano([
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Kalkulator začeća', putanja: '/kalkulator-zaceca' },
      ]),
    ]);
  }

  izracunaj() {
    let termin: Date;

    if (this.nacin === 'termin') {
      if (!this.datumTermina) {
        this.greska.set('Upiši termin porođaja.');
        return;
      }
      termin = new Date(this.datumTermina + 'T00:00:00');
      if (Number.isNaN(termin.getTime())) {
        this.greska.set('Datum nije ispravan.');
        return;
      }
    } else {
      if (this.nedeljaSada === null || this.nedeljaSada < 1 || this.nedeljaSada > 42) {
        this.greska.set('Upiši nedelju između 1 i 42.');
        return;
      }
      // Iz trenutne nedelje se prvo dolazi do termina, pa se dalje računa isto.
      termin = new Date();
      termin.setDate(termin.getDate() + (40 - this.nedeljaSada) * 7);
    }

    // Termin je 280 dana od poslednje menstruacije, a začeće oko 14 dana posle nje.
    const pm = new Date(termin);
    pm.setDate(pm.getDate() - 280);

    const najverovatnije = new Date(pm);
    najverovatnije.setDate(najverovatnije.getDate() + 14);

    // Plodni prozor: pet dana pre ovulacije i dan posle nje.
    const od = new Date(najverovatnije);
    od.setDate(od.getDate() - 5);
    const doDatuma = new Date(najverovatnije);
    doDatuma.setDate(doDatuma.getDate() + 1);

    const danas = new Date();
    danas.setHours(0, 0, 0, 0);
    const protekloDana = Math.floor((danas.getTime() - pm.getTime()) / 86_400_000);

    this.greska.set('');
    this.rezultat.set({
      zaceceOd: od,
      zaceceDo: doDatuma,
      najverovatnije,
      poslednjaMenstruacija: pm,
      nedeljaSada: Math.max(0, Math.floor(protekloDana / 7)),
    });
  }

  formatiraj(d: Date): string {
    return d.toLocaleDateString(LOKAL, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatirajKratko(d: Date): string {
    return d.toLocaleDateString(LOKAL, { day: 'numeric', month: 'short' });
  }
}
