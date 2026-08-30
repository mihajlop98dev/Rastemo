import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Heart, Menu, X } from 'lucide-angular';
import { LEGAL_CONTACT_EMAIL, BRAND_NAME } from '../../../core/data/legal';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-javni-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
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
