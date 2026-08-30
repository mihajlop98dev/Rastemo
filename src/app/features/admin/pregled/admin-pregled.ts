import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Users, Baby, MessagesSquare, Stethoscope, Flag, UserPlus, AlertTriangle, ArrowRight } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { RefreshCw } from 'lucide-angular';
import { UiButton } from '../../../shared/ui/button/button';
import { AdminService, STRIKE_LIMIT } from '../../../core/services/admin.service';
import { LOKAL } from '../../../core/data/lokalizacija';

/**
 * Početni ekran admin panela.
 *
 * Prvo se prikazuje ono što traži postupak — prijave, nepotvrđeni lekari,
 * nalozi sa opomenama. Brojke koje samo opisuju stanje idu ispod: one se
 * gledaju s vremena na vreme, a poslovi svaki dan.
 */
@Component({
  selector: 'app-admin-pregled',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiButton],
  templateUrl: './admin-pregled.html',
  styleUrl: './admin-pregled.scss',
})
export class AdminPregled implements OnInit {
  readonly admin = inject(AdminService);
  readonly STRIKE_LIMIT = STRIKE_LIMIT;

  async ngOnInit() {
    if (!this.admin.stats()) {
      await Promise.all([
        this.admin.loadStats(),
        this.admin.loadUsers(),
        this.admin.loadReports(),
        this.admin.loadContent(),
      ]);
    }
  }

  /** Poslovi koji čekaju; prazan spisak znači da je sve obrađeno. */
  readonly zadaci = computed(() => {
    const s = this.admin.stats();
    if (!s) return [];
    const z: { naziv: string; broj: number; putanja: string; opis: string }[] = [];

    if (s.pendingReports) {
      z.push({
        naziv: 'Prijave na čekanju', broj: s.pendingReports, putanja: '/admin/prijave',
        opis: 'Neko je prijavio sadržaj i čeka odluku.',
      });
    }
    if (s.unverifiedDoctors) {
      z.push({
        naziv: 'Nepotvrđeni lekari', broj: s.unverifiedDoctors, putanja: '/admin/lekari',
        opis: 'Unos korisnica koji još nije proveren.',
      });
    }
    if (this.naliciZaBrisanje().length) {
      z.push({
        naziv: 'Nalozi sa opomenama', broj: this.naliciZaBrisanje().length, putanja: '/admin/korisnice',
        opis: `Prešli su ${STRIKE_LIMIT} uklonjena sadržaja.`,
      });
    }
    return z;
  });

  readonly naliciZaBrisanje = computed(() =>
    this.admin.users().filter(u => (u.strikes ?? 0) >= STRIKE_LIMIT),
  );

  readonly brojke = computed(() => {
    const s = this.admin.stats();
    if (!s) return [];
    // Svaka brojka vodi tamo gde se sa njom nešto radi; broj koji ne vodi
    // nigde tera na traženje po meniju.
    return [
      { naziv: 'Korisnica', vrednost: s.users, ikona: Users,
        dodatak: `+${s.newUsers7d} za 7 dana`, putanja: '/admin/korisnice' },
      { naziv: 'Aktivnih trudnoća', vrednost: s.pregnancies, ikona: Baby,
        dodatak: null, putanja: null },
      { naziv: 'Tema na forumu', vrednost: s.topics, ikona: MessagesSquare,
        dodatak: `${s.posts} odgovora`, putanja: '/admin/zajednica' },
      { naziv: 'Lekara u bazi', vrednost: s.doctors, ikona: Stethoscope,
        dodatak: null, putanja: '/admin/lekari' },
    ];
  });

  /**
   * Registracije po danima za poslednjih trideset dana.
   *
   * Crta se kao SVG, bez biblioteke: nekoliko desetina tačaka ne opravdava
   * dodatnih sto kilobajta u panelu koji otvara jedna osoba.
   */
  readonly rast = computed(() => {
    const DANA = 30;
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);

    const poDanu = new Map<string, number>();
    for (let i = DANA - 1; i >= 0; i--) {
      const d = new Date(danas);
      d.setDate(d.getDate() - i);
      poDanu.set(this.kljucDana(d), 0);
    }

    for (const u of this.admin.users()) {
      const k = this.kljucDana(new Date(u.created_at));
      if (poDanu.has(k)) poDanu.set(k, (poDanu.get(k) ?? 0) + 1);
    }

    const vrednosti = [...poDanu.entries()].map(([dan, broj]) => ({ dan, broj }));
    const najvise = Math.max(1, ...vrednosti.map(v => v.broj));

    // Kumulativ pokazuje rast; dnevni broj sam po sebi je kod malih brojeva
    // samo niz nula sa po jednim štapićem.
    let zbir = 0;
    const ukupno = vrednosti.map(v => ({ ...v, zbir: (zbir += v.broj) }));
    const najveciZbir = Math.max(1, zbir);

    return {
      vrednosti: ukupno,
      najvise,
      putanja: ukupno
        .map((v, i) => {
          const x = (i / Math.max(1, ukupno.length - 1)) * 100;
          const y = 100 - (v.zbir / najveciZbir) * 100;
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' '),
      ukupnoNovih: zbir,
    };
  });

  private kljucDana(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** Poslednje što se desilo — nove korisnice i novi sadržaj, izmešano. */
  readonly aktivnost = computed(() => {
    const stavke: { kada: string; tekst: string; vrsta: string }[] = [];

    for (const u of this.admin.users().slice(0, 8)) {
      stavke.push({
        kada: u.created_at,
        tekst: `${u.full_name || 'Bez imena'} je otvorila nalog`,
        vrsta: 'nalog',
      });
    }
    for (const c of this.admin.content().slice(0, 8)) {
      stavke.push({
        kada: c.created_at,
        tekst: c.kind === 'topic' ? `Nova tema: ${c.title ?? ''}` : 'Novi odgovor na forumu',
        vrsta: 'forum',
      });
    }

    return stavke
      .sort((a, b) => b.kada.localeCompare(a.kada))
      .slice(0, 10);
  });

  /** „pre 3 dana" se čita brže od datuma kad je reč o skorašnjem. */
  pre(iso: string): string {
    const sati = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
    if (sati < 1) return 'upravo';
    if (sati < 24) return `pre ${sati} h`;
    const dana = Math.floor(sati / 24);
    if (dana === 1) return 'juče';
    if (dana < 30) return `pre ${dana} dana`;
    return this.formatirajDatum(iso);
  }

  readonly osvezavam = signal(false);

  /** Panel se drži otvoren satima, pa podaci umeju da zastare. */
  async osvezi() {
    this.osvezavam.set(true);
    try {
      await Promise.all([
        this.admin.loadStats(),
        this.admin.loadUsers(),
        this.admin.loadReports(),
        this.admin.loadContent(),
      ]);
    } finally {
      this.osvezavam.set(false);
    }
  }

  formatirajDatum(iso: string): string {
    return new Date(iso).toLocaleDateString(LOKAL, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  readonly FlagIcon = Flag;
  readonly AlertIcon = AlertTriangle;
  readonly StrelicaIcon = ArrowRight;
  readonly NoviIcon = UserPlus;
  readonly OsveziIkona = RefreshCw;
}
