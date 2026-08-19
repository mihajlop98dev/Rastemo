import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, MapPin, Phone } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { ClinicService, ClinicRow } from '../../../core/services/clinic.service';
import { SeoService } from '../../vodic/seo.service';
import { LOKAL } from '../../../core/data/lokalizacija';

@Component({
  selector: 'app-porodilista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiButton],
  templateUrl: './porodilista.html',
  styleUrls: ['../javno.scss', './porodilista.scss']
})
export class Porodilista implements OnInit {
  private seo = inject(SeoService);
  readonly pojam = signal('');

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

  readonly poGradovima = computed(() => {
    const p = this.slozi(this.pojam().trim());
    const lista = p
      ? this.clinics.all().filter(k => this.slozi(`${k.name} ${k.city ?? ''}`).includes(p))
      : this.clinics.all();

    const mapa = new Map<string, ClinicRow[]>();
    for (const k of lista) {
      const grad = k.city ?? 'Ostalo';
      mapa.set(grad, [...(mapa.get(grad) ?? []), k]);
    }
    return [...mapa.entries()]
      .map(([grad, ustanove]) => ({ grad, ustanove }))
      .sort((a, b) => a.grad.localeCompare(b.grad, LOKAL));
  });

  readonly ukupno = computed(() => this.clinics.all().length);

  readonly MapIcon = MapPin;
  readonly PhoneIcon = Phone;
}
