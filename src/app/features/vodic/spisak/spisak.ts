import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Heart } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { VODIC } from '../../../core/data/vodic-nedelje';
import { babyComparisonForWeek, trimesterForWeek } from '../../../core/data/baby-growth';
import { SeoService } from '../seo.service';

@Component({
  selector: 'app-vodic-spisak',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiButton],
  templateUrl: './spisak.html',
  styleUrl: './spisak.scss'
})
export class VodicSpisak implements OnInit {
  private seo = inject(SeoService);

  readonly trimestri = [1, 2, 3].map(t => ({
    broj: t,
    naziv: `${t}. trimestar`,
    nedelje: VODIC.filter(v => trimesterForWeek(v.nedelja) === t),
  }));

  ngOnInit() {
    this.seo.postavi(
      'Kalendar trudnoće — nedelju po nedelju',
      'Kalendar trudnoće po nedeljama: šta se dešava sa bebom i sa tobom u svakoj nedelji, od 4. do 42. Jednostavno i pregledno.',
      '/trudnoca',
    );

    this.seo.strukturirano([
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Trudnoća nedelju po nedelju',
        numberOfItems: VODIC.length,
        itemListElement: VODIC.map((v, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: v.naslov,
          url: `https://dnevniktrudnoce.com/trudnoca/${v.nedelja}`,
        })),
      },
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Nedelju po nedelju', putanja: '/trudnoca' },
      ]),
    ]);
  }

  poredjenje(n: number): string { return babyComparisonForWeek(n); }

  readonly HeartIcon = Heart;
}
