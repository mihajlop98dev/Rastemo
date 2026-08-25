import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { Ime, imeZaSlug, slicnaImena, slugZaIme, OZNAKA_POREKLA, POREKLO_GENITIV, tekstUcestalosti } from '../../../core/data/imena';
import { SeoService } from '../../vodic/seo.service';

@Component({
  selector: 'app-ime-detalj',
  standalone: true,
  imports: [CommonModule, RouterLink, UiCard, UiButton],
  templateUrl: './imena-detalj.html',
  styleUrls: ['../javno.scss', './imena-detalj.scss']
})
export class ImeDetalj implements OnInit {
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);

  readonly ime = signal<Ime | null>(null);
  readonly slicna = signal<Ime[]>([]);
  readonly slug = slugZaIme;
  readonly oznaka = OZNAKA_POREKLA;
  readonly genitiv = POREKLO_GENITIV;
  readonly ucestalost = tekstUcestalosti;

  ngOnInit() {
    this.route.paramMap.subscribe(p => {
      const i = imeZaSlug(p.get('ime') ?? '') ?? null;
      this.ime.set(i);
      this.slicna.set(i ? slicnaImena(i) : []);
      if (i) this.oznaci(i);
    });
  }

  private oznaci(i: Ime) {
    const putanja = `/imena/${slugZaIme(i.ime)}`;
    const zaKoga = i.pol === 'z' ? 'devojčicu' : 'dečaka';
    this.seo.postavi(
      `${i.ime} — značenje imena`,
      `${i.ime} je ime za ${zaKoga} ${this.genitiv[i.poreklo]} porekla i znači „${i.znacenje}". ${i.objasnjenje}`,
      putanja,
    );
    this.seo.strukturirano([
      {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        name: i.ime,
        description: `${i.znacenje} (${this.oznaka[i.poreklo]} poreklo)`,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'Značenje imena',
          url: 'https://dnevniktrudnoce.com/imena',
        },
        url: `https://dnevniktrudnoce.com${putanja}`,
      },
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Značenje imena', putanja: '/imena' },
        { naziv: i.ime, putanja },
      ]),
    ]);
  }
}
