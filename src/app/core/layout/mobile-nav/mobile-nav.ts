import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { mobileNavItems } from '../nav-items';
import { iconMap } from '../icon-map';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './mobile-nav.html',
  styleUrl: './mobile-nav.scss'
})
export class MobileNav {
  readonly items = mobileNavItems;
  readonly iconMap = iconMap;
}
