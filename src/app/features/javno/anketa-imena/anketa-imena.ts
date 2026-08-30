import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';
import { AnketaImenaService, Anketa, Rezultat } from '../../../core/services/anketa-imena.service';
import { IMENA } from '../../../core/data/imena';

/**
 * Anketa za ime: praviš spisak, šalješ link, porodica glasa.
 *
 * Ista komponenta služi i za pravljenje i za glasanje — šta se prikazuje
 * zavisi od toga da li u adresi ima koda ankete.
 */
@Component({
  selector: 'app-anketa-imena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCard, UiButton],
  templateUrl: './anketa-imena.html',
  styleUrls: ['../javno.scss', './anketa-imena.scss'],
})
export class AnketaImena implements OnInit {
  private seo = inject(SeoService);
  private route = inject(ActivatedRoute);
  readonly svc = inject(AnketaImenaService);

  readonly ucitavanje = signal(true);
  readonly anketa = signal<Anketa | null>(null);
  readonly rezultati = signal<Rezultat[]>([]);
  readonly mojGlas = signal<string | null>(null);
  readonly greska = signal('');

  // --- pravljenje ---
  naslov = '';
  readonly izabrana = signal<string[]>([]);
  readonly pojam = signal('');
  readonly napravljenKod = signal<string | null>(null);
  readonly pravi = signal(false);
  readonly linkKopiran = signal(false);

  readonly predlozi = computed(() => {
    const p = this.pojam().trim().toLowerCase();
    if (p.length < 2) return [];
    return IMENA
      .filter(i => i.ime.toLowerCase().startsWith(p))
      .filter(i => !this.izabrana().includes(i.ime))
      .slice(0, 8);
  });

  async ngOnInit() {
    const kod = this.route.snapshot.paramMap.get('kod');

    if (!kod) {
      this.seo.postavi(
        'Anketa za ime bebe — neka porodica glasa',
        'Napravi spisak imena, pošalji link porodici i vidi ko za koje glasa. Bez naloga i bez registracije.',
        '/anketa-imena',
      );
      this.ucitavanje.set(false);
      return;
    }

    const a = await this.svc.ucitaj(kod);
    if (!a) {
      this.greska.set('Ova anketa ne postoji ili je istekla.');
      this.ucitavanje.set(false);
      return;
    }

    this.anketa.set(a);
    this.mojGlas.set(await this.svc.vecGlasao(a.id));
    this.rezultati.set(await this.svc.rezultati(a.id, a.imena));

    this.seo.bezIndeksiranja(a.naslov || 'Anketa za ime');
    this.ucitavanje.set(false);
  }

  dodaj(ime: string) {
    if (this.izabrana().length >= 10) return;
    this.izabrana.update(l => [...l, ime]);
    this.pojam.set('');
  }

  ukloni(ime: string) {
    this.izabrana.update(l => l.filter(i => i !== ime));
  }

  async napravi() {
    if (this.izabrana().length < 2) {
      this.greska.set('Izaberi bar dva imena.');
      return;
    }
    this.pravi.set(true);
    try {
      const kod = await this.svc.napravi(this.izabrana(), this.naslov);
      this.napravljenKod.set(kod);
      this.greska.set('');
    } catch {
      this.greska.set('Nešto je pošlo naopako. Probaj ponovo.');
    } finally {
      this.pravi.set(false);
    }
  }

  get link(): string {
    const kod = this.napravljenKod();
    return kod ? `https://dnevniktrudnoce.com/anketa-imena/${kod}` : '';
  }

  async kopirajLink() {
    await navigator.clipboard.writeText(this.link);
    this.linkKopiran.set(true);
  }

  async glasaj(ime: string) {
    const a = this.anketa();
    if (!a || this.mojGlas()) return;

    const uspelo = await this.svc.glasaj(a.id, ime);
    if (uspelo) this.mojGlas.set(ime);
    else this.greska.set('Sa ovog uređaja je već glasano.');

    this.rezultati.set(await this.svc.rezultati(a.id, a.imena));
  }

  get ukupnoGlasova(): number {
    return this.rezultati().reduce((z, r) => z + r.glasova, 0);
  }

  procenat(r: Rezultat): number {
    const uk = this.ukupnoGlasova;
    return uk ? Math.round((r.glasova / uk) * 100) : 0;
  }
}
