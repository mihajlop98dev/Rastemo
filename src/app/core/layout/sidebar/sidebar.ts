import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Heart, PhoneCall } from 'lucide-angular';
import { navItems } from '../nav-items';
import { iconMap } from '../icon-map';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  readonly navItems = navItems;
  readonly iconMap = iconMap;
  readonly HeartIcon = Heart;
  readonly PhoneIcon = PhoneCall;
}
