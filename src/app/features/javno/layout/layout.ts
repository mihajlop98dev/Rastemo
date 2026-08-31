import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Heart, Menu, X } from 'lucide-angular';
import { LEGAL_CONTACT_EMAIL, BRAND_NAME } from '../../../core/data/legal';
import { AuthService } from '../../../core/services/auth.service';
import { Sidebar } from '../../../core/layout/sidebar/sidebar';
import { Topbar } from '../../../core/layout/topbar/topbar';
import { MobileNav } from '../../../core/layout/mobile-nav/mobile-nav';
import { inject } from '@angular/core';

@Component({
  selector: 'app-javni-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, Sidebar, Topbar, MobileNav],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class JavniLayout {
  readonly meniOtvoren = signal(false);

  /**
   * Forum je javan, pa prijavljena korisnica lako završi na javnoj stranici.
   * Bez ovoga bi joj u vrhu i dalje pisalo „Prijavi se", kao da je odjavljena.
   */
  readonly auth = inject(AuthService);

  /**
   * Prijavljena korisnica dobija okvir aplikacije i na javnim stranicama.
   *
   * Forum, imena i kalkulatori žive na javnim adresama zbog pretrage, ali se
   * do njih dolazi i iz aplikacije. Bez ovoga bi joj na svakom takvom koraku
   * nestao levi meni i ostala bi bez načina da nastavi dalje.
   *
   * Čeka se `ready()` da se okvir ne bi menjao pred očima: dok se sesija
   * učitava `user()` je prazno. Pri predrenderu `ready()` nikad ne postane
   * tačno, pa se u HTML koji vidi pretraživač uvek upiše javna verzija.
   */
  readonly uAplikaciji = computed(() => this.auth.ready() && !!this.auth.user());

  readonly stavke = [
    { putanja: '/trudnoca', naziv: 'Nedelju po nedelju' },
    { putanja: '/kalkulator-termina', naziv: 'Kalkulator termina' },
    { putanja: '/zajednica', naziv: 'Zajednica' },
    { putanja: '/porodilista', naziv: 'Porodilišta' },
    { putanja: '/zabava', naziv: 'Zabava' },
    { putanja: '/cesta-pitanja', naziv: 'Česta pitanja' },
    { putanja: '/o-nama', naziv: 'O nama' },
  ];

  readonly godina = new Date().getFullYear();
  readonly kontakt = LEGAL_CONTACT_EMAIL;
  readonly brend = BRAND_NAME;

  readonly HeartIcon = Heart;
  readonly MenuIcon = Menu;
  readonly XIcon = X;
}
