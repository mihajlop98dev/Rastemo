import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, MapPin, Phone, Navigation } from 'lucide-angular';
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

  /** Klik na ustanovu je centrira na mapi; mapa se sama dovodi u vidokrug. */
  prikaziNaMapi(u: ClinicRow) {
    if (u.lat === null || u.lng === null) return;
    this.fokus.set(u);
  }

  /**
   * Link koji na telefonu otvara Google mape, po mogućstvu odmah sa putanjom.
   *
   * Uvek koordinate kad postoje. Tekstualni upit je probavan i nije pouzdan:
   * za Kikindu je Google vratio dom zdravlja umesto bolnice iako je adresa
   * bila u upitu. Zato tekst ide samo kad koordinata nema, i tada vodi na
   * pretragu a ne na navigaciju — da žena vidi rezultate i sama izabere,
   * umesto da je aplikacija pošalje na pogrešnu adresu.
   */
  navigacija(u: ClinicRow): string {
    if (u.lat !== null && u.lng !== null) {
      return `https://www.google.com/maps/dir/?api=1&destination=${u.lat},${u.lng}`;
    }
    const upit = [u.name, u.address, u.city, 'Srbija'].filter(Boolean).join(', ');
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(upit);
  }

  /** Bez koordinata link vodi na pretragu, pa i tekst mora to da kaže. */
  nazivLinka(u: ClinicRow): string {
    return u.lat !== null ? 'Putanja do ustanove' : 'Pronađi na mapama';
  }

  readonly MapIcon = MapPin;
  readonly NavIcon = Navigation;
  readonly PhoneIcon = Phone;
}
