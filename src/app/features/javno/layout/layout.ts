import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Heart, Menu, X } from 'lucide-angular';
import { LEGAL_CONTACT_EMAIL, BRAND_NAME } from '../../../core/data/legal';

@Component({
  selector: 'app-javni-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class JavniLayout {
  readonly meniOtvoren = signal(false);

  readonly stavke = [
    { putanja: '/trudnoca', naziv: 'Nedelju po nedelju' },
    { putanja: '/kalkulator-termina', naziv: 'Kalkulator termina' },
    { putanja: '/imena', naziv: 'Značenje imena' },
    { putanja: '/porodilista', naziv: 'Porodilišta' },
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
