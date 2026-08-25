import { Component, OnInit, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, MapPin, Phone } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { ClinicService, ClinicRow } from '../../../core/services/clinic.service';
import { MapaKlinika } from '../../../shared/mapa/mapa-klinika';
import { SeoService } from '../../vodic/seo.service';
import { LOKAL } from '../../../core/data/lokalizacija';

@Component({
  selector: 'app-porodilista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiButton, MapaKlinika],
  templateUrl: './porodilista.html',
  styleUrls: ['../javno.scss', './porodilista.scss']
})
export class Porodilista implements OnInit {
  private seo = inject(SeoService);
  readonly pojam = signal('');
  /** Prazno znači sve gradove. */
  readonly izabraniGrad = signal('');

  constructor(readonly clinics: ClinicService) {}

  async ngOnInit() {
    this.seo.postavi(
      'Porodilišta u Srbiji',
      'Spisak porodilišta i ginekološko-akušerskih ustanova u Srbiji, po gradovima, sa adresama i telefonima.',
      '/porodilista',
    );
    await this.clinics.load();
  }

  /** Bez ovoga pretraga „cacak" ne bi našla „Čačak". */
  private slozi(s: string): string {
    return s.toLowerCase()
      .replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'd');
  }

  /** Svi gradovi u kojima postoji bar jedna ustanova, srpskim redosledom. */
  readonly gradovi = computed(() =>
    [...new Set(this.clinics.all().map(k => k.city).filter((g): g is string => !!g))]
      .sort((a, b) => a.localeCompare(b, LOKAL))
  );

  readonly poGradovima = computed(() => {
    const p = this.slozi(this.pojam().trim());
    const grad = this.izabraniGrad();

    let lista = this.clinics.all();
    if (grad) lista = lista.filter(k => k.city === grad);
    if (p) lista = lista.filter(k => this.slozi(`${k.name} ${k.city ?? ''}`).includes(p));

    const mapa = new Map<string, ClinicRow[]>();
    for (const k of lista) {
      const grad = k.city ?? 'Ostalo';
      mapa.set(grad, [...(mapa.get(grad) ?? []), k]);
    }
    return [...mapa.entries()]
      .map(([grad, ustanove]) => ({ grad, ustanove }))
      .sort((a, b) => a.grad.localeCompare(b.grad, LOKAL));
  });

  /** Ustanova na koju je kliknuto u spisku — mapa doleti do nje. */
  readonly fokus = signal<ClinicRow | null>(null);

  /** Prati filter — mapa pokazuje tačno ono što i spisak ispod nje. */
  readonly zaMapu = computed(() =>
    this.poGradovima().flatMap(g => g.ustanove).filter(k => k.lat !== null && k.lng !== null)
  );

  readonly ukupno = computed(() => this.clinics.all().length);
  readonly prikazano = computed(() => this.poGradovima().reduce((n, g) => n + g.ustanove.length, 0));

  /**
   * Klik na ustanovu je centrira na mapi. Mapa je iznad spiska, pa se posle
   * klika mora i doskrolovati — inače se na telefonu ništa vidljivo ne desi.
   */
  prikaziNaMapi(u: ClinicRow) {
    if (u.lat === null || u.lng === null) return;
    this.fokus.set(u);
    this.platnoMape?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  @ViewChild('mapaElement') platnoMape?: ElementRef<HTMLElement>;

  readonly MapIcon = MapPin;
  readonly PhoneIcon = Phone;
}
