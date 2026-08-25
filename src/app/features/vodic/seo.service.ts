import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

const OSNOVA = 'https://dnevniktrudnoce.com';

/**
 * Naslov, opis, društvene kartice i strukturirani podaci.
 *
 * Koristi se Angular-ov DOCUMENT, a ne globalni `document`: pri pečenju
 * statičkog HTML-a globalni ne postoji, a Angular-ov pokazuje na serverski DOM.
 * Zahvaljujući tome sve što se ovde upiše završi u ispečenoj strani, pa to vide
 * i pretraživači i Facebook, koji JavaScript ne izvršavaju.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  postavi(naslov: string, opis: string, putanja: string, slika = '/icon-512.png') {
    const pun = `${naslov} — Dnevnik trudnoće`;
    const url = OSNOVA + putanja;
    // Google odseca opis oko 160 znakova; duži samo razvodni poruku.
    const kratakOpis = opis.length > 158 ? opis.slice(0, 155).trimEnd() + '…' : opis;

    this.title.setTitle(pun);
    this.meta.updateTag({ name: 'description', content: kratakOpis });

    this.meta.updateTag({ property: 'og:title', content: pun });
    this.meta.updateTag({ property: 'og:description', content: kratakOpis });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: OSNOVA + slika });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Dnevnik trudnoće' });
    this.meta.updateTag({ property: 'og:locale', content: 'sr_RS' });

    // Bez ovoga Twitter i deo aplikacija za poruke prikažu samo goli link.
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pun });
    this.meta.updateTag({ name: 'twitter:description', content: kratakOpis });
    this.meta.updateTag({ name: 'twitter:image', content: OSNOVA + slika });

    this.kanonska(url);
  }

  /**
   * Sklanja stranicu iz pretrage.
   *
   * Za ekrane koji nemaju šta da ponude nekome ko dolazi sa pretraživača —
   * prijava, registracija, potvrde. Bez ovoga se takve stranice indeksiraju
   * kao tanak sadržaj i razblažuju ono što zaista treba da se nađe.
   */
  bezIndeksiranja(naslov: string) {
    this.title.setTitle(`${naslov} — Dnevnik trudnoće`);
    this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
  }

  /** Isti tekst dostupan na više adresa deluje kao umnožen sadržaj. */
  private kanonska(url: string) {
    let veza = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!veza) {
      veza = this.doc.createElement('link');
      veza.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(veza);
    }
    veza.setAttribute('href', url);
  }

  /**
   * Strukturirani podaci — njima pretraživač razume šta je stranica, a ne samo
   * koje reči sadrži. Od toga zavisi da li se u rezultatima pojave proširene
   * kartice umesto golog linka.
   */
  strukturirano(podaci: object | object[], oznaka = 'seo-ld') {
    for (const stari of Array.from(this.doc.querySelectorAll(`script[data-oznaka="${oznaka}"]`))) {
      stari.remove();
    }
    const s = this.doc.createElement('script');
    s.setAttribute('type', 'application/ld+json');
    s.setAttribute('data-oznaka', oznaka);
    s.textContent = JSON.stringify(podaci);
    this.doc.head.appendChild(s);
  }

  /** Putanja do stranice, koju Google prikazuje umesto gole adrese. */
  mrvice(stavke: { naziv: string; putanja: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: stavke.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.naziv,
        item: OSNOVA + s.putanja,
      })),
    };
  }
}
