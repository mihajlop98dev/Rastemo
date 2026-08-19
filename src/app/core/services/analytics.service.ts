import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export const GA_MERENJE_ID = 'G-L9JMKJD8HV';

/** Izbor korisnice se pamti lokalno; nije lični podatak i ne ide u bazu. */
const KLJUC = 'dt-kolacici';
export type Pristanak = 'prihvaceno' | 'odbijeno';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Google analitika se NE učitava dok korisnica ne pristane.
 *
 * Kolačići za merenje nisu neophodni za rad aplikacije, pa po zakonu traže
 * saglasnost pre postavljanja — a ne obaveštenje posle. Zato skripta ovde ne
 * stoji u index.html nego se ubacuje tek na "Prihvatam".
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  readonly pristanak = signal<Pristanak | null>(null);
  private ucitano = false;

  /** Stranice se peku u HTML pri build-u, gde localStorage i window ne postoje. */
  private uPregledacu = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private router: Router) {}

  /** Poziva se jednom, pri pokretanju aplikacije. */
  init() {
    if (!this.uPregledacu) return;
    const sacuvano = this.procitaj();
    this.pristanak.set(sacuvano);
    if (sacuvano === 'prihvaceno') this.ukljuci();
  }

  private procitaj(): Pristanak | null {
    try {
      const v = localStorage.getItem(KLJUC);
      return v === 'prihvaceno' || v === 'odbijeno' ? v : null;
    } catch {
      return null;   // privatni režim zna da zabrani localStorage
    }
  }

  prihvati() {
    this.zapamti('prihvaceno');
    this.ukljuci();
  }

  odbij() {
    this.zapamti('odbijeno');
    // Skripta nikad nije ni učitana, pa nema šta da se gasi. Ako je korisnica
    // ranije prihvatila pa se predomislila, gasimo merenje do osvežavanja
    // strane — sam gtag se iz stranice ne može ukloniti.
    if (this.ucitano) window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  }

  private zapamti(v: Pristanak) {
    this.pristanak.set(v);
    try { localStorage.setItem(KLJUC, v); } catch { /* bez pamćenja, pitaćemo opet */ }
  }

  private ukljuci() {
    if (this.ucitano || !this.uPregledacu) return;
    this.ucitano = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };

    // Sve što nije merenje ostaje odbijeno — reklamni kolačići se ne koriste.
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MERENJE_ID}`;
    document.head.appendChild(s);

    window.gtag('js', new Date());
    window.gtag('config', GA_MERENJE_ID, {
      anonymize_ip: true,
      // Adresa strane se šalje ručno pri svakoj promeni rute (vidi ispod).
      send_page_view: false,
    });

    this.posalji(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.posalji(e.urlAfterRedirects));
  }

  /**
   * Aplikacija je jednostranična, pa gtag sam ne vidi promenu ekrana.
   * Iz adrese se uklanjaju upitnici i identifikatori — u njima ume da se nađe
   * ime lekara iz pretrage ili id teme, a to ne treba da napusti aplikaciju.
   */
  private posalji(url: string) {
    if (!this.ucitano) return;
    const cist = url.split('?')[0].split('#')[0]
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id');
    window.gtag?.('event', 'page_view', {
      page_path: cist,
      page_title: document.title,
    });
  }
}
