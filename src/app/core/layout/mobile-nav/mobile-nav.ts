import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class MobileNav implements OnInit, OnDestroy {
  readonly iconMap = iconMap;

  @ViewChild('nav', { static: true }) private navRef!: ElementRef<HTMLElement>;

  private rafId: number | null = null;
  private readonly onViewportChange = () => this.repositionForZoom();

  constructor(private admin: AdminService, private zone: NgZone) {}

  /** Administrator dobija samo svoju stavku — ostatak app-a ga ne zanima. */
  get items() {
    return this.admin.isAdmin() ? [adminNavItem] : mobileNavItems;
  }

  ngOnInit(): void {
    const vv = window.visualViewport;
    if (!vv) return;
    this.zone.runOutsideAngular(() => {
      vv.addEventListener('resize', this.onViewportChange);
      vv.addEventListener('scroll', this.onViewportChange);
    });
  }

  ngOnDestroy(): void {
    const vv = window.visualViewport;
    if (!vv) return;
    vv.removeEventListener('resize', this.onViewportChange);
    vv.removeEventListener('scroll', this.onViewportChange);
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  /**
   * iOS Safari (i pojedini Android browseri) pri pinch-zoom-u "otkače"
   * position: fixed elemente od vizuelnog viewporta — traka ostaje na svom
   * mestu u layout viewportu dok se vidljiva oblast ekrana pomera, pa
   * izgleda kao da meni ispadne sa ekrana. Vraćamo je na dno vidljive
   * oblasti pomoću Visual Viewport API-ja, bez uticaja na izgled kad
   * korisnica nije zumirana.
   */
  private repositionForZoom(): void {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      const vv = window.visualViewport;
      const el = this.navRef?.nativeElement;
      if (!vv || !el) return;

      if (vv.scale <= 1.01) {
        el.style.transform = '';
        return;
      }

      const offsetX = vv.offsetLeft;
      const offsetY = vv.offsetTop + vv.height - document.documentElement.clientHeight;
      // scale(1 / vv.scale) kontra-skalira traku tako da vizuelno ostane iste
      // veličine dok se stranica zumira. Mora ostati usklađeno sa
      // `transform-origin: bottom left` u mobile-nav.scss (ta dva mesta su
      // međusobno zavisna).
      el.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${1 / vv.scale})`;
    });
  }
}
