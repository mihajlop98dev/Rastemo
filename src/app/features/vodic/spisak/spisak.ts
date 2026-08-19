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
      'Trudnoća nedelju po nedelju',
      'Šta se dešava sa bebom i sa tobom u svakoj nedelji trudnoće, od 4. do 42. Na srpskom, jednostavno i pregledno.',
      '/trudnoca',
    );
  }

  poredjenje(n: number): string { return babyComparisonForWeek(n); }

  readonly HeartIcon = Heart;
}
