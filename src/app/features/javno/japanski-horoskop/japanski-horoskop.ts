import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';
import {
  JUNISHI, JunishiZnak, ELEMENTI, Eto,
  etoZaDatum, getSanhe, getLiuhe, getChong, jeHinoeuma,
} from '../../../core/data/japanski';
import { KINESKA_NOVA_GODINA } from '../../../core/data/zabava';
import { datumURecenici } from '../../../core/data/lokalizacija';

/** Kakav je odnos između znaka deteta i znaka majke. */
type Odnos = 'sanhe' | 'liuhe' | 'chong' | 'isti' | 'neutralno';

@Component({
  selector: 'app-japanski-horoskop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCard, UiButton],
  templateUrl: './japanski-horoskop.html',
  styleUrls: ['../javno.scss', './japanski-horoskop.scss']
})
export class JapanskiHoroskop implements OnInit {
  private seo = inject(SeoService);

  datum = '';
  datumMajke = '';

  readonly eto = signal<Eto | null>(null);
  readonly etoMajke = signal<Eto | null>(null);
  readonly greska = signal('');
  readonly sviZnaci = JUNISHI;
  readonly elementi = ELEMENTI;

  ngOnInit() {
    this.seo.postavi(
      'Japanski horoskop za bebu — eto znak po godini rođenja',
      'Koji je japanski znak tvoje bebe: životinja, element, jin ili jang i eto kombinacija. Sa objašnjenjem zašto godina ne počinje prvog januara.',
      '/japanski-horoskop',
    );
    this.seo.strukturirano([
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Zabava', putanja: '/zabava' },
        { naziv: 'Japanski horoskop', putanja: '/japanski-horoskop' },
      ]),
    ]);
  }

  get najmanjaGodina(): number {
    return Math.min(...Object.keys(KINESKA_NOVA_GODINA).map(Number));
  }
  get najvecaGodina(): number {
    return Math.max(...Object.keys(KINESKA_NOVA_GODINA).map(Number));
  }

  izracunaj() {
    this.greska.set('');
    this.eto.set(null);
    this.etoMajke.set(null);

    if (!this.datum) {
      this.greska.set('Unesi termin porođaja ili datum rođenja bebe.');
      return;
    }
    const d = new Date(this.datum + 'T00:00:00');
    const r = etoZaDatum(d);
    if (!r) {
      this.greska.set(`Tablica pokriva godine od ${this.najmanjaGodina} do ${this.najvecaGodina}.`);
      return;
    }
    this.eto.set(r);

    if (this.datumMajke) {
      this.etoMajke.set(etoZaDatum(new Date(this.datumMajke + 'T00:00:00')));
    }
  }

  /** Dan kad počinje lunarna godina u kojoj je dete rođeno — za objašnjenje. */
  granicaGodine(e: Eto): string {
    const iso = KINESKA_NOVA_GODINA[e.godina];
    return iso ? datumURecenici(new Date(iso + 'T00:00:00')) : '';
  }

  hinoeuma(e: Eto): boolean { return jeHinoeuma(e); }

  sanhe(z: JunishiZnak): string[] { return getSanhe(z.srpski); }
  liuhe(z: JunishiZnak): string | null { return getLiuhe(z.srpski); }
  chong(z: JunishiZnak): string | null { return getChong(z.srpski); }

  /** Odnos bebinog i majčinog znaka; bira se gotov tekst, ništa se ne sklapa. */
  odnos(): Odnos | null {
    const b = this.eto()?.znak.srpski;
    const m = this.etoMajke()?.znak.srpski;
    if (!b || !m) return null;
    if (b === m) return 'isti';
    if (getSanhe(b).includes(m)) return 'sanhe';
    if (getLiuhe(b) === m) return 'liuhe';
    if (getChong(b) === m) return 'chong';
    return 'neutralno';
  }

  readonly tekstOdnosa: Record<Odnos, { naslov: string; telo: string }> = {
    sanhe: {
      naslov: 'Trojna sloga (sanhe)',
      telo: 'Vaša dva znaka pripadaju istoj trojci — u predanju je to najskladniji odnos u krugu. Tumači se kao da se razumete bez mnogo reči: slično reagujete na iste stvari, pa vam ni tempo ni raspoloženje ne idu u raskorak.',
    },
    liuhe: {
      naslov: 'Tajna sloga (liuhe)',
      telo: 'Vaša dva znaka su par tajne sloge — spajaju se tako što se razlikuju. Predanje kaže da ono što jednom ide teško, drugom ide lako, pa se popunjavate umesto da se takmičite.',
    },
    chong: {
      naslov: 'Sudar (chong)',
      telo: 'Vaša dva znaka stoje jedan naspram drugog u krugu, a to se zove sudar. Ne znači nesklad nego različit tempo: ono što tebi deluje prirodno, njemu neće, i obrnuto. U predanju se takav par opisuje kao onaj koji jedno drugo najviše nauči — ali ne bez trenja.',
    },
    isti: {
      naslov: 'Isti znak',
      telo: 'Beba dolazi u istom znaku kao i ti, samo dvanaest ili više godina kasnije u krugu. Predanje kaže da se takav par prepoznaje odmah, sa svim što uz to ide — i sličnim snagama i istim slabostima.',
    },
    neutralno: {
      naslov: 'Bez posebnog odnosa',
      telo: 'Vaša dva znaka nisu ni u jednoj od tri klasične veze — ni u trojnoj slozi, ni u tajnoj, ni u sudaru. U predanju je to miran odnos bez naglašene napetosti i bez naglašenog privlačenja.',
    },
  };
}
