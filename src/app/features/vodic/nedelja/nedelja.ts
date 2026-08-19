import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, Heart, ChevronLeft, ChevronRight, Baby, User, Lightbulb } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { BabyVisual } from '../../../shared/illustrations/baby-visual/baby-visual';
import { VODIC, vodicZaNedelju, NedeljaVodic } from '../../../core/data/vodic-nedelje';
import { babyLengthForWeek, babyWeightForWeek, babyComparisonForWeek, babyLengthLabelForWeek, trimesterForWeek } from '../../../core/data/baby-growth';
import { SeoService } from '../seo.service';

@Component({
  selector: 'app-vodic-nedelja',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiButton, BabyVisual],
  templateUrl: './nedelja.html',
  styleUrl: './nedelja.scss'
})
export class VodicNedelja implements OnInit {
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);

  readonly podaci = signal<NedeljaVodic | null>(null);
  readonly prva = VODIC[0].nedelja;
  readonly poslednja = VODIC[VODIC.length - 1].nedelja;

  ngOnInit() {
    // Ruta se menja bez ponovnog pravljenja komponente kad se ide na susednu
    // nedelju, pa se prati parametar umesto da se čita jednom.
    this.route.paramMap.subscribe(p => {
      const n = Number(p.get('nedelja'));
      const v = vodicZaNedelju(n) ?? null;
      this.podaci.set(v);
      if (v) this.seo.postavi(v.naslov, `${v.uvod} ${v.beba}`.slice(0, 155), `/trudnoca/${v.nedelja}`);
    });
  }

  get duzina(): number { return babyLengthForWeek(this.podaci()!.nedelja); }
  get tezina(): number { return babyWeightForWeek(this.podaci()!.nedelja); }
  get poredjenje(): string { return babyComparisonForWeek(this.podaci()!.nedelja); }
  get oznakaDuzine(): string { return babyLengthLabelForWeek(this.podaci()!.nedelja); }
  get trimestar(): number { return trimesterForWeek(this.podaci()!.nedelja); }

  /** Težina ispod grama se ne prikazuje kao „0 g". */
  get tezinaTekst(): string {
    const g = this.tezina;
    if (!g) return 'manje od 1 g';
    return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`;
  }

  readonly HeartIcon = Heart;
  readonly PrevIcon = ChevronLeft;
  readonly NextIcon = ChevronRight;
  readonly BabyIcon = Baby;
  readonly UserIcon = User;
  readonly TipIcon = Lightbulb;
}
