import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';
import { IMENA, slugZaIme } from '../../../core/data/imena';
import { Ime } from '../../../core/data/imena-tip';

interface Nalaz {
  vrsta: 'dobro' | 'pazi';
  tekst: string;
}

/**
 * Kako ime zvuči uz prezime.
 *
 * Ovo nije nauka i tako je i napisano na stranici. Proverava se nekoliko
 * stvari koje se u govoru stvarno primete: da se ime i prezime ne završavaju
 * isto, da se slogovi ne sudaraju, i šta ispadne od inicijala.
 */
@Component({
  selector: 'app-ime-uz-prezime',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCard, UiButton],
  templateUrl: './ime-uz-prezime.html',
  styleUrls: ['../javno.scss', './ime-uz-prezime.scss'],
})
export class ImeUzPrezime implements OnInit {
  private seo = inject(SeoService);

  readonly ime = signal('');
  readonly prezime = signal('');
  readonly slug = slugZaIme;

  ngOnInit() {
    this.seo.postavi(
      'Kako ime zvuči uz prezime',
      'Upiši ime i prezime pa vidi kako zvuče zajedno: broj slogova, ponavljanje glasova, inicijali i dužina punog imena.',
      '/ime-uz-prezime',
    );
    this.seo.strukturirano([
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Ime uz prezime', putanja: '/ime-uz-prezime' },
      ]),
    ]);
  }

  private readonly SAMOGLASNICI = 'aeiouAEIOU';

  /** Slogova ima otprilike koliko i samoglasnika — dovoljno za ritam. */
  private slogovi(rec: string): number {
    return [...rec].filter(z => this.SAMOGLASNICI.includes(z)).length;
  }

  readonly nalazi = computed<Nalaz[]>(() => {
    const i = this.ime().trim();
    const p = this.prezime().trim();
    if (!i || !p) return [];

    const rez: Nalaz[] = [];
    const si = this.slogovi(i);
    const sp = this.slogovi(p);

    // Kratko ime uz dugačko prezime (i obrnuto) obično zvuči uravnoteženije
    // nego dva ista — „Ana Petrović" prijatnije nego „Ana Rić".
    if (si === sp && si <= 2) {
      rez.push({ vrsta: 'pazi', tekst: `Oba su kratka — ${si} sloga. Zajedno mogu da zvuče odsečno.` });
    } else if (Math.abs(si - sp) >= 2) {
      rez.push({ vrsta: 'dobro', tekst: `Lepo se smenjuju: ${si} i ${sp} sloga.` });
    } else {
      rez.push({ vrsta: 'dobro', tekst: `Ravnoteža slogova je uredna: ${si} i ${sp}.` });
    }

    const zavrsetakImena = i.slice(-1).toLowerCase();
    const pocetakPrezimena = p.slice(0, 1).toLowerCase();
    if (zavrsetakImena === pocetakPrezimena) {
      rez.push({
        vrsta: 'pazi',
        tekst: `Ime se završava na „${zavrsetakImena}", a prezime tim istim glasom počinje — u govoru se stapaju.`,
      });
    }

    if (i.slice(-2).toLowerCase() === p.slice(-2).toLowerCase()) {
      rez.push({ vrsta: 'pazi', tekst: 'Ime i prezime se završavaju isto, pa zvuče kao rima.' });
    }

    const inicijali = (i[0] + p[0]).toUpperCase();
    rez.push({ vrsta: 'dobro', tekst: `Inicijali: ${inicijali}` });

    const ukupno = i.length + p.length + 1;
    if (ukupno > 22) {
      rez.push({ vrsta: 'pazi', tekst: `Puno ime ima ${ukupno} slova — dugačko za obrasce i dokumenta.` });
    }

    return rez;
  });

  /** Predlaže imena koja se po dužini dobro slažu sa unetim prezimenom. */
  readonly predlozi = computed<Ime[]>(() => {
    const p = this.prezime().trim();
    if (!p) return [];
    const sp = this.slogovi(p);

    const odgovaraju = IMENA
      .filter(x => {
        const razlika = Math.abs(this.slogovi(x.ime) - sp);
        return razlika === 1 || razlika === 2;
      })
      .filter(x => x.ime.slice(-1).toLowerCase() !== p.slice(0, 1).toLowerCase());

    // Uzimanje prvih dvanaest dalo bi sama imena na „A". Bira se svako n-to,
    // pa predlozi pokriju celu azbuku i oba pola.
    const koliko = 12;
    const korak = Math.max(1, Math.floor(odgovaraju.length / koliko));
    return odgovaraju.filter((_, i) => i % korak === 0).slice(0, koliko);
  });

  readonly pokazano = signal(false);

  prikazi() {
    this.pokazano.set(true);
  }
}
