import { Component, OnInit, signal, computed, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';
import { LOKAL } from '../../../core/data/lokalizacija';
import { mesecZaNedelju } from '../../../core/data/mesec-trudnoce';

@Component({
  selector: 'app-odbrojavanje',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCard, UiButton],
  templateUrl: './odbrojavanje.html',
  styleUrls: ['../javno.scss', './odbrojavanje.scss'],
})
export class Odbrojavanje implements OnInit {
  private seo = inject(SeoService);
  @ViewChild('platno') platno?: ElementRef<HTMLCanvasElement>;

  readonly termin = signal('');
  readonly sacuvano = signal(false);

  ngOnInit() {
    this.seo.postavi(
      'Odbrojavanje do termina porođaja',
      'Koliko je još ostalo do termina? Upiši datum i podeli sliku sa odbrojavanjem, nedeljom trudnoće i mesecom.',
      '/odbrojavanje',
    );
    this.seo.strukturirano([
      this.seo.mrvice([
        { naziv: 'Početna', putanja: '/' },
        { naziv: 'Odbrojavanje', putanja: '/odbrojavanje' },
      ]),
    ]);
  }

  readonly stanje = computed(() => {
    const unos = this.termin();
    if (!unos) return null;
    const t = new Date(unos + 'T00:00:00');
    if (Number.isNaN(t.getTime())) return null;

    const danas = new Date();
    danas.setHours(0, 0, 0, 0);
    const preostalo = Math.ceil((t.getTime() - danas.getTime()) / 86_400_000);
    const protekloDana = 280 - preostalo;
    const nedelja = Math.max(0, Math.floor(protekloDana / 7));

    return {
      preostaloDana: preostalo,
      preostaloNedelja: Math.max(0, Math.floor(preostalo / 7)),
      nedelja,
      mesec: mesecZaNedelju(nedelja),
      procenat: Math.min(100, Math.max(0, Math.round((protekloDana / 280) * 100))),
      termin: t,
      prosao: preostalo < 0,
    };
  });

  formatiraj(d: Date): string {
    return d.toLocaleDateString(LOKAL, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /**
   * Crta sliku za deljenje.
   *
   * Slika se pravi u pregledaču i nigde se ne šalje — upisani termin ne
   * napušta telefon. Zato nema ni servera ni naloga za ovu stranicu.
   */
  async preuzmiSliku() {
    const s = this.stanje();
    const c = this.platno?.nativeElement;
    if (!s || !c) return;

    const V = 1080;
    c.width = V;
    c.height = V;
    const g = c.getContext('2d');
    if (!g) return;

    const pozadina = g.createLinearGradient(0, 0, V, V);
    pozadina.addColorStop(0, '#FDF9F4');
    pozadina.addColorStop(1, '#FBE5D8');
    g.fillStyle = pozadina;
    g.fillRect(0, 0, V, V);

    g.textAlign = 'center';

    g.fillStyle = '#6F6259';
    g.font = '500 38px system-ui, sans-serif';
    g.fillText(s.prosao ? 'Termin je prošao' : 'Još samo', V / 2, 300);

    g.fillStyle = '#CE4F68';
    g.font = '700 200px system-ui, sans-serif';
    g.fillText(String(Math.abs(s.preostaloDana)), V / 2, 480);

    g.fillStyle = '#372E2A';
    g.font = '500 52px system-ui, sans-serif';
    g.fillText(Math.abs(s.preostaloDana) === 1 ? 'dan' : 'dana', V / 2, 560);

    g.fillStyle = '#6F6259';
    g.font = '400 40px system-ui, sans-serif';
    g.fillText(`${s.nedelja}. nedelja · ${s.mesec}. mesec`, V / 2, 660);

    // Traka napretka
    const sirina = 640, visina = 22, x = (V - sirina) / 2, y = 730;
    g.fillStyle = '#EFE2D3';
    g.beginPath();
    g.roundRect(x, y, sirina, visina, 11);
    g.fill();
    g.fillStyle = '#E5677E';
    g.beginPath();
    g.roundRect(x, y, (sirina * s.procenat) / 100, visina, 11);
    g.fill();

    g.fillStyle = '#A79A8E';
    g.font = '400 30px system-ui, sans-serif';
    g.fillText(`termin ${this.formatiraj(s.termin)}`, V / 2, 810);
    g.fillText('dnevniktrudnoce.com', V / 2, 960);

    const url = c.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'odbrojavanje.png';
    a.click();
    this.sacuvano.set(true);
  }
}
