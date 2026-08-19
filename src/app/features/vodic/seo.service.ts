import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

/**
 * Naslov i opis stranice za pretraživače i deljenje.
 *
 * Aplikacija je jednostranična, pa se <title> ne menja sam pri promeni rute —
 * bez ovoga bi svih četrdeset stranica vodiča imalo isti naslov u Google
 * rezultatima i bile bi neupotrebljive.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  postavi(naslov: string, opis: string, putanja: string) {
    const pun = `${naslov} — Dnevnik trudnoće`;
    const url = `https://dnevniktrudnoce.com${putanja}`;

    this.title.setTitle(pun);
    this.meta.updateTag({ name: 'description', content: opis });
    this.meta.updateTag({ property: 'og:title', content: pun });
    this.meta.updateTag({ property: 'og:description', content: opis });
    this.meta.updateTag({ property: 'og:url', content: url });

    // Bez kanonske adrese isti tekst dostupan preko više putanja deluje kao
    // umnožen sadržaj, što pretraživači kažnjavaju.
    let veza = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!veza) {
      veza = document.createElement('link');
      veza.rel = 'canonical';
      document.head.appendChild(veza);
    }
    veza.href = url;
  }
}
