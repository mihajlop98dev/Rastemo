import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Heart, Activity, Users, Stethoscope, Sparkles, ShoppingBag } from 'lucide-angular';
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
    { label: 'Praćenje', icon: Activity, path: '/pracenje' },
    { label: 'Zajednica', icon: Users, path: '/zajednica' },
    { label: 'Lekari', icon: Stethoscope, path: '/lekari' },
    { label: 'AI pomoćnik', icon: Sparkles, path: '/ai' },
    { label: 'Priprema', icon: ShoppingBag, path: '/priprema' },
    { label: 'Partner', icon: Heart, path: '/pocetna' },
  ];

  readonly HeartIcon = Heart;
}
