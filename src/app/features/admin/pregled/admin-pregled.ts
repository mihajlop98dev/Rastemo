import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Users, Baby, MessagesSquare, Stethoscope, Flag, UserPlus, AlertTriangle, ArrowRight } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
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
      await Promise.all([this.admin.loadStats(), this.admin.loadUsers(), this.admin.loadReports()]);
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
    return [
      { naziv: 'Korisnica', vrednost: s.users, ikona: Users, dodatak: `+${s.newUsers7d} za 7 dana` },
      { naziv: 'Aktivnih trudnoća', vrednost: s.pregnancies, ikona: Baby, dodatak: null },
      { naziv: 'Tema na forumu', vrednost: s.topics, ikona: MessagesSquare, dodatak: `${s.posts} odgovora` },
      { naziv: 'Lekara u bazi', vrednost: s.doctors, ikona: Stethoscope, dodatak: null },
    ];
  });

  formatirajDatum(iso: string): string {
    return new Date(iso).toLocaleDateString(LOKAL, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  readonly FlagIcon = Flag;
  readonly AlertIcon = AlertTriangle;
  readonly StrelicaIcon = ArrowRight;
  readonly NoviIcon = UserPlus;
}
