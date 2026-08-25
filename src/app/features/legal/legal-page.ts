import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, Heart, ArrowLeft } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { AuthService } from '../../core/services/auth.service';
import { LegalDocument, TERMS_DOCUMENT, PRIVACY_DOCUMENT } from '../../core/data/legal';
import { SeoService } from '../vodic/seo.service';

/**
 * Jedna komponenta služi i za /uslovi-koriscenja i za /politika-privatnosti —
 * koji se dokument prikazuje govori `data.doc` iz rute. Stranice su javne
 * (bez guard-a) jer se link na njih nudi i pre registracije.
 */
@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss'
})
export class LegalPage {
  readonly HeartIcon = Heart;
  readonly BackIcon = ArrowLeft;

  readonly doc: LegalDocument;
  readonly otherLink: { path: string; label: string };

  constructor(route: ActivatedRoute, private auth: AuthService, seo: SeoService) {
    const which = route.snapshot.data['doc'] as 'terms' | 'privacy';
    this.doc = which === 'privacy' ? PRIVACY_DOCUMENT : TERMS_DOCUMENT;
    this.otherLink = which === 'privacy'
      ? { path: '/uslovi-koriscenja', label: 'Uslovi korišćenja' }
      : { path: '/politika-privatnosti', label: 'Politika privatnosti' };

    // Obe stranice su ranije delile naslov sa početnom, pa su za pretraživač
    // izgledale kao njena kopija.
    if (which === 'privacy') {
      seo.postavi(
        'Politika privatnosti',
        'Koje podatke Dnevnik trudnoće prikuplja, zašto ih čuva, koliko dugo i kako se brišu. Podaci o trudnoći vidljivi su samo tebi.',
        '/politika-privatnosti',
      );
    } else {
      seo.postavi(
        'Uslovi korišćenja',
        'Pravila korišćenja aplikacije Dnevnik trudnoće: šta aplikacija jeste, šta nije, i zašto ne zamenjuje savet lekara.',
        '/uslovi-koriscenja',
      );
    }
  }

  /**
   * Stranica je javna, pa se do nje dolazi i iz app-a i sa landinga. Ulogovanu
   * korisnicu vraćamo na Početnu u app-u; nju bi landing samo zbunio.
   */
  get backPath(): string {
    return this.auth.user() ? '/home' : '/';
  }

  get backLabel(): string {
    return this.auth.user() ? 'Nazad u aplikaciju' : 'Nazad';
  }
}
