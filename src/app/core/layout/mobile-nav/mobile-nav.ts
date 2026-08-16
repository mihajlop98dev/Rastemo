import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { mobileNavItems, adminNavItem } from '../nav-items';
import { AdminService } from '../../services/admin.service';
import { iconMap } from '../icon-map';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './mobile-nav.html',
  styleUrl: './mobile-nav.scss'
})
export class MobileNav {
  readonly iconMap = iconMap;

  constructor(private admin: AdminService) {}

  /** Administrator dobija samo svoju stavku — ostatak app-a ga ne zanima. */
  get items() {
    return this.admin.isAdmin() ? [adminNavItem] : mobileNavItems;
  }
}
