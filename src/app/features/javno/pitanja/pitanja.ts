import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';

interface Pitanje { pitanje: string; odgovor: string; }

@Component({
  selector: 'app-pitanja',
  standalone: true,
  imports: [CommonModule, RouterLink, UiCard, UiButton],
  templateUrl: './pitanja.html',
  styleUrls: ['../javno.scss', './pitanja.scss']
})
export class Pitanja implements OnInit {
  private seo = inject(SeoService);

  /** Otvoreno pitanje; jedno po jedno, da se strana ne razvuče. */
  readonly otvoreno = signal<number | null>(0);

  readonly grupe: { naslov: string; pitanja: Pitanje[] }[] = [
    {
      naslov: 'O aplikaciji',
      pitanja: [
        { pitanje: 'Da li je aplikacija besplatna?',
          odgovor: 'Jeste, u potpunosti. Nema pretplate, nema plaćenih funkcija i nema reklama unutar aplikacije.' },
        { pitanje: 'Treba li da skinem nešto sa Google Play-a?',
          odgovor: 'Ne. Aplikacija radi u pregledaču, na telefonu i računaru. Možeš je dodati na početni ekran telefona i ponašaće se kao svaka druga aplikacija.' },
        { pitanje: 'Mogu li da je koristim ako sam tek saznala da sam trudna?',
          odgovor: 'Možeš, i to je najbolji trenutak. Dovoljno je da upišeš datum poslednje menstruacije ili termin porođaja — sve ostalo se računa samo.' },
        { pitanje: 'Šta ako izgubim pristup nalogu?',
          odgovor: 'Na strani za prijavu klikni „Zaboravila si je?" i stiže ti link za novu lozinku. Ako ni to ne pomogne, piši nam.' },
      ],
    },
    {
      naslov: 'Privatnost',
      pitanja: [
        { pitanje: 'Ko vidi šta upišem?',
          odgovor: 'Samo ti. Simptome, težinu, raspoloženje, beleške i poruke ne vidi niko drugi — ni administrator aplikacije. To nije stvar poverenja nego pravila u samoj bazi, koja takav pristup ne dozvoljavaju.' },
        { pitanje: 'Prodajete li podatke?',
          odgovor: 'Ne. Podaci se ne prodaju, ne razmenjuju i ne koriste za reklamiranje. Ne pravimo profile za ciljanje oglasa.' },
        { pitanje: 'Mogu li da pišem na forumu anonimno?',
          odgovor: 'Možeš, i to je izbor za svaku objavu posebno. U profilu možeš podesiti da anonimno bude podrazumevano.' },
        { pitanje: 'Kako da obrišem nalog?',
          odgovor: 'U profilu. Brisanjem naloga brišu se i svi tvoji unosi. Rezervne kopije se prepisuju najkasnije u roku od 30 dana.' },
      ],
    },
    {
      naslov: 'Sadržaj i lekari',
      pitanja: [
        { pitanje: 'Odakle vam podaci o razvoju bebe?',
          odgovor: 'Iz javno dostupnih stručnih izvora — prosečne vrednosti rasta ploda po nedeljama i smernice Instituta za medicinu (IOM) za prirast telesne mase u trudnoći. To su proseci; svaka trudnoća odstupa i to je uredno.' },
        { pitanje: 'Odakle spisak lekara?',
          odgovor: 'Iz javno objavljenog registra izdatih licenci Lekarske komore Srbije. Preuzimamo ime, titulu, broj licence, specijalizaciju i rok važenja licence — ništa privatno. Grad i ustanovu dopunjuju korisnice.' },
        { pitanje: 'Preporučujete li lekare?',
          odgovor: 'Ne. Ocene i komentari su lična iskustva korisnica, ne stručna procena. Oznaka pored imena znači samo da licenca postoji u registru Komore — ništa više.' },
        { pitanje: 'Ja sam lekar i ne želim da budem na spisku.',
          odgovor: 'Piši nam i uklonićemo te bez traženja obrazloženja i bez odlaganja.' },
      ],
    },
    {
      naslov: 'Zdravlje',
      pitanja: [
        { pitanje: 'Može li aplikacija da zameni lekara?',
          odgovor: 'Ne, i nikada neće pokušati. Ne postavljamo dijagnoze, ne preporučujemo lekove i ne tumačimo nalaze. Ništa ovde ne treba da odloži odlazak kod ginekologa.' },
        { pitanje: 'Šta da radim u hitnom slučaju?',
          odgovor: 'Kod krvarenja, jakog bola, curenja plodove vode ili izostanka pokreta bebe ne otvaraj aplikaciju — pozovi 194 ili idi u najbliže porodilište.' },
        { pitanje: 'Beba mi je manja nego što aplikacija kaže. Da li je to problem?',
          odgovor: 'Brojevi u aplikaciji su proseci, a ne norma. Odstupanja su uobičajena i mnogo toga zavisi od nasleđa i načina merenja. Jedini merodavan odgovor daje tvoj lekar na osnovu ultrazvuka.' },
      ],
    },
  ];

  prebaci(indeks: number) {
    this.otvoreno.set(this.otvoreno() === indeks ? null : indeks);
  }

  /** Jedinstven redni broj kroz sve grupe, da se otvara tačno jedno pitanje. */
  redni(grupa: number, stavka: number): number {
    return grupa * 100 + stavka;
  }

  ngOnInit() {
    this.seo.postavi(
      'Česta pitanja',
      'Odgovori na najčešća pitanja o aplikaciji, privatnosti podataka, spisku lekara i tome šta aplikacija jeste a šta nije.',
      '/cesta-pitanja',
    );

    // FAQPage je jedina oznaka koja Google-u dozvoljava da pitanja i odgovore
    // prikaže proširena, direktno u rezultatu pretrage.
    this.seo.strukturirano([
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: 'sr-Latn-RS',
        mainEntity: this.grupe.flatMap(g => g.pitanja).map(p => ({
          '@type': 'Question',
          name: p.pitanje,
          acceptedAnswer: { '@type': 'Answer', text: p.odgovor },
        })),
      },
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Česta pitanja', putanja: '/cesta-pitanja' },
      ]),
    ]);
  }
}
