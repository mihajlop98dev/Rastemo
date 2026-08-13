import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Heart, Activity, Users, Stethoscope, ShoppingBag, ClipboardList } from 'lucide-angular';
import { UiButton } from '../../shared/ui/button/button';
import { MomVisual } from '../../shared/illustrations/mom-visual/mom-visual';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiButton, MomVisual],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  readonly shortcuts = [
    { label: 'Praćenje', icon: Activity, path: '/tracking' },
    { label: 'Zajednica', icon: Users, path: '/community' },
    { label: 'Lekari', icon: Stethoscope, path: '/doctors' },
    { label: 'Kalendar', icon: ClipboardList, path: '/calendar' },
    { label: 'Priprema', icon: ShoppingBag, path: '/preparation' },
  ];

  readonly HeartIcon = Heart;
}
