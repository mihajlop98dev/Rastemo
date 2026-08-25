import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { IMENA, Ime, slugZaIme } from '../../../core/data/imena';
import { SeoService } from '../../vodic/seo.service';

@Component({
  selector: 'app-imena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCard, UiButton],
  templateUrl: './imena.html',
  styleUrls: ['../javno.scss', './imena.scss']
})
export class Imena implements OnInit {
  private seo = inject(SeoService);

  readonly pojam = signal('');
  readonly pol = signal<'' | 'z' | 'm'>('');
  readonly slovo = signal('');

  readonly slug = slugZaIme;

  /** Prvo slovo svakog imena, za traku sa azbukom. */
  readonly slova = [...new Set(IMENA.map(i => i.ime[0]))].sort((a, b) => a.localeCompare(b, 'sr-Latn-RS'));

  private fold(s: string): string {
    return s.toLowerCase().replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'd');
  }

  readonly rezultati = computed(() => {
    const p = this.fold(this.pojam().trim());
    return IMENA.filter(i =>
      (!this.pol() || i.pol === this.pol()) &&
      (!this.slovo() || i.ime[0] === this.slovo()) &&
      (!p || this.fold(`${i.ime} ${i.znacenje}`).includes(p))
    );
  });

  readonly ukupno = IMENA.length;

  ngOnInit() {
    this.seo.postavi(
      'Značenje imena',
      `Značenje i poreklo ${IMENA.length} imena za devojčice i dečake — odakle dolaze i šta zaista znače.`,
      '/imena',
    );
    this.seo.strukturirano([
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Značenje imena',
        inLanguage: 'sr-Latn-RS',
        url: 'https://dnevniktrudnoce.com/imena',
      },
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Značenje imena', putanja: '/imena' },
      ]),
    ]);
  }
}
