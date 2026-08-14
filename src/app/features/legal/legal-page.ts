import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, Heart, ArrowLeft } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { AuthService } from '../../core/services/auth.service';
import { LegalDocument, TERMS_DOCUMENT, PRIVACY_DOCUMENT } from '../../core/data/legal';

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

  constructor(route: ActivatedRoute, private auth: AuthService) {
    const which = route.snapshot.data['doc'] as 'terms' | 'privacy';
    this.doc = which === 'privacy' ? PRIVACY_DOCUMENT : TERMS_DOCUMENT;
    this.otherLink = which === 'privacy'
      ? { path: '/uslovi-koriscenja', label: 'Uslovi korišćenja' }
      : { path: '/politika-privatnosti', label: 'Politika privatnosti' };
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
