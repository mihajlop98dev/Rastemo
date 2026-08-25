import {
  Component, Input, OnDestroy, OnChanges, SimpleChanges,
  ElementRef, ViewChild, signal, AfterViewInit, ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicRow } from '../../core/services/clinic.service';

/**
 * Mapa porodilišta.
 *
 * Leaflet se povlači dinamičkim importom, pa ne opterećuje ostale stranice.
 * Pločice dolaze sa OpenStreetMap-a, što znači da pregledač šalje zahtev
 * njihovom serveru čim se ova stranica otvori — zabeleženo u politici
 * privatnosti.
 *
 * Leaflet menja DOM mimo Angular-a, pa se instanca čuva ručno i uništava
 * u ngOnDestroy.
 */
@Component({
  selector: 'app-mapa-klinika',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mapa">
      <div #platno class="mapa__platno"></div>
      <p class="mapa__poruka" *ngIf="!spremna()">Učitavam mapu…</p>
      <p class="mapa__nota" *ngIf="spremna() && imaPribliznih">
        Ustanove označene svetlijim krugom nemaju adresu u bazi, pa je prikazan centar grada.
      </p>
    </div>
  `,
  styleUrl: './mapa-klinika.scss',
  // Leaflet ubacuje pločice i kontrole bez Angular-ovog atributa, pa im scoped
  // stilovi ne bi važili. Njegove klase su sve pod prefiksom `.leaflet-`.
  encapsulation: ViewEncapsulation.None,
})
export class MapaKlinika implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) klinike: ClinicRow[] = [];
  /** Kad se postavi, mapa doleti do te ustanove i otvori njen opis. */
  @Input() fokus: ClinicRow | null = null;

  @ViewChild('platno', { static: true }) platno!: ElementRef<HTMLDivElement>;

  readonly spremna = signal(false);

  private L: any = null;
  private mapa: any = null;
  private markeri = new Map<string, any>();

  get imaPribliznih(): boolean {
    return this.klinike.some(k => k.lokacija_priblizna && k.lat !== null);
  }

  async ngAfterViewInit() {
    this.L = await import('leaflet');
    this.mapa = this.L.map(this.platno.nativeElement, { scrollWheelZoom: false });

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.mapa);

    this.nacrtaj();
    this.spremna.set(true);
    if (this.fokus) this.priblizi(this.fokus);
  }

  ngOnChanges(promene: SimpleChanges) {
    if (!this.mapa) return;
    if (promene['klinike']) this.nacrtaj();
    if (promene['fokus'] && this.fokus) this.priblizi(this.fokus);
  }

  /** Iscrtava markere iz trenutne liste; stari se uklanjaju da se ne gomilaju. */
  private nacrtaj() {
    for (const m of this.markeri.values()) m.remove();
    this.markeri.clear();

    const saKoordinatama = this.klinike.filter(k => k.lat !== null && k.lng !== null);
    if (!saKoordinatama.length) return;

    for (const k of saKoordinatama) {
      const priblizna = k.lokacija_priblizna;
      const m = this.L.circleMarker([k.lat!, k.lng!], {
        radius: 8,
        color: priblizna ? '#c99' : '#c2185b',
        fillColor: priblizna ? '#f3d6de' : '#e91e63',
        fillOpacity: priblizna ? 0.45 : 0.85,
        weight: 2,
      })
        .addTo(this.mapa)
        .bindPopup(this.opis(k));
      this.markeri.set(k.id, m);
    }

    // Prikaz se namešta prema stvarnim tačkama, da ne bude zakucan na Beograd.
    const granice = this.L.latLngBounds(
      saKoordinatama.map(k => [k.lat!, k.lng!] as [number, number]),
    );
    this.mapa.fitBounds(granice, { padding: [30, 30] });
  }

  private priblizi(k: ClinicRow) {
    const m = this.markeri.get(k.id);
    if (!m || k.lat === null || k.lng === null) return;

    // Spisak je ispod mape, pa je posle klika mapa najčešće van ekrana —
    // bez ovoga se ništa vidljivo ne desi, pogotovo na telefonu.
    //
    // Namerno `auto`, ne `smooth`: spisak je dugačak preko deset hiljada
    // piksela, a glatko skrolovanje na toj razdaljini Chrome prekine na pola
    // pa se stranica uopšte ne pomeri.
    const platno = this.platno.nativeElement;
    const okvir = platno.getBoundingClientRect();
    if (okvir.bottom < 0 || okvir.top > window.innerHeight) {
      platno.scrollIntoView({ behavior: 'auto', block: 'center' });
    }

    this.mapa.flyTo([k.lat, k.lng], 15, { duration: 0.6 });
    m.openPopup();
  }

  private opis(k: ClinicRow): string {
    const red = (t: string) => `<div>${this.bezHtml(t)}</div>`;
    const delovi = [`<strong>${this.bezHtml(k.name)}</strong>`];
    if (k.address) delovi.push(red(k.address));
    if (k.city) delovi.push(red(k.city));
    if (k.phone) {
      const cist = this.bezHtml(k.phone);
      delovi.push(`<a href="tel:${cist.replace(/[^0-9+]/g, '')}">${cist}</a>`);
    }
    if (k.lokacija_priblizna) delovi.push('<em>Približna lokacija — centar grada</em>');
    delovi.push(
      `<a href="${this.navigacija(k)}" target="_blank" rel="noopener">Putanja do ustanove</a>`,
    );
    return delovi.join('');
  }

  /** Na mapi su samo ustanove sa koordinatama, pa link uvek vodi na putanju. */
  private navigacija(k: ClinicRow): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${k.lat},${k.lng}`;
  }

  /** Nazivi i adrese dolaze iz baze; u popup idu kao tekst, ne kao HTML. */
  private bezHtml(s: string): string {
    return s.replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
  }

  ngOnDestroy() {
    this.mapa?.remove();
    this.mapa = null;
    this.markeri.clear();
  }
}
