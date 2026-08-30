import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';
import { IMENA } from '../../../core/data/imena';

@Component({
  selector: 'app-zabava',
  standalone: true,
  imports: [CommonModule, RouterLink, UiCard, UiButton],
  templateUrl: './zabava.html',
  styleUrls: ['../javno.scss', './zabava.scss']
})
export class Zabava implements OnInit {
  private seo = inject(SeoService);

  readonly stavke = [
    {
      putanja: '/imena',
      emoji: '📖',
      naslov: 'Značenje imena',
      opis: `Odakle ime dolazi i šta zaista znači — ${IMENA.length} imena sa poreklom.`,
      oznaka: `${IMENA.length} imena`,
    },
    {
      putanja: '/pol-bebe',
      emoji: '🔮',
      naslov: 'Kinesko računanje pola',
      opis: 'Stara tablica koja iz godina majke i meseca začeća pogađa pol. Za zabavu.',
      oznaka: 'za zabavu',
    },
    {
      putanja: '/kineski-horoskop',
      emoji: '🐉',
      naslov: 'Kineski znak bebe',
      opis: 'Koja je životinja tvoje bebe u kineskom krugu od dvanaest znakova.',
      oznaka: 'za zabavu',
    },
    {
      putanja: '/anketa-imena',
      emoji: '🗳️',
      naslov: 'Anketa za ime',
      opis: 'Napravi spisak imena i pošalji link porodici da glasa.',
      oznaka: 'bez naloga',
    },
    {
      putanja: '/ime-uz-prezime',
      emoji: '🔤',
      naslov: 'Ime uz prezime',
      opis: 'Kako izabrano ime zvuči uz vaše prezime — ritam, glasovi, inicijali.',
      oznaka: 'za zabavu',
    },
    {
      putanja: '/odbrojavanje',
      emoji: '⏳',
      naslov: 'Odbrojavanje do termina',
      opis: 'Koliko je još ostalo, sa slikom koju možeš da podeliš.',
      oznaka: 'sa slikom',
    },
    {
      putanja: '/kalkulator-zaceca',
      emoji: '📅',
      naslov: 'Kalkulator začeća',
      opis: 'Kada je došlo do začeća, iz termina ili nedelje u kojoj si sada.',
      oznaka: 'kalkulator',
    },
    {
      putanja: '/horoskopski-znak',
      emoji: '✨',
      naslov: 'Horoskopski znak bebe',
      opis: 'Znak po terminu porođaja, i šta se u tradiciji vezuje za njega.',
      oznaka: 'za zabavu',
    },
  ];

  ngOnInit() {
    this.seo.postavi(
      'Zabava',
      'Značenje imena, kineski i naš horoskop bebe i stara kineska tablica pola. Sve na jednom mestu, za razonodu dok čekaš.',
      '/zabava',
    );
    this.seo.strukturirano([
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Zabava', putanja: '/zabava' },
      ]),
    ]);
  }
}
