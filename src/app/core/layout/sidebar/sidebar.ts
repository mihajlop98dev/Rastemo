import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Heart, PhoneCall, X } from 'lucide-angular';
import { navItems, adminNavItem } from '../nav-items';
import { AdminService } from '../../services/admin.service';
import { iconMap } from '../icon-map';

interface EmergencyNumber {
  label: string;
  number: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {
  readonly navItems = navItems;
  readonly adminNavItem = adminNavItem;
  readonly iconMap = iconMap;

  readonly showEmergency = signal(false);

  readonly emergencyNumbers: EmergencyNumber[] = [
    { label: 'Hitna pomoć', number: '194' },
    { label: 'Policija', number: '192' },
    { label: 'Vatrogasci', number: '193' },
  ];

  readonly HeartIcon = Heart;
  readonly PhoneIcon = PhoneCall;
  readonly XIcon = X;

  constructor(readonly admin: AdminService) {}

  async ngOnInit() {
    await this.admin.checkAdmin();
  }
}
