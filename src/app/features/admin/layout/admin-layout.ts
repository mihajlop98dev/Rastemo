import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LucideAngularModule, Shield, LayoutDashboard, Flag, MessagesSquare, Users, Stethoscope, Tag, ScrollText, LogOut, Menu, X, Activity } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';

/**
 * Okvir admin panela.
 *
 * Namerno odvojen od okvira aplikacije: admin nema šta da traži u pretrazi
 * lekara, porukama ni dugmetu za hitnu pomoć, a ni u tuđoj trudnoći. Ovde su
 * samo poslovi moderacije.
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private auth = inject(AuthService);
  private router = inject(Router);
  readonly admin = inject(AdminService);

  readonly meniOtvoren = signal(false);

  readonly stavke = [
    { putanja: '/admin', naziv: 'Pregled', ikona: LayoutDashboard, tacno: true },
    { putanja: '/admin/prijave', naziv: 'Prijave', ikona: Flag, tacno: false },
    { putanja: '/admin/zajednica', naziv: 'Zajednica', ikona: MessagesSquare, tacno: false },
    { putanja: '/admin/korisnice', naziv: 'Korisnice', ikona: Users, tacno: false },
    { putanja: '/admin/aktivnost', naziv: 'Aktivnost', ikona: Activity, tacno: false },
    { putanja: '/admin/lekari', naziv: 'Lekari', ikona: Stethoscope, tacno: false },
    { putanja: '/admin/imena', naziv: 'Predložena imena', ikona: Tag, tacno: false },
    { putanja: '/admin/dnevnik', naziv: 'Dnevnik rada', ikona: ScrollText, tacno: false },
  ];

  /** Broj koji traži pažnju — prikazuje se uz stavku. */
  oznaka(putanja: string): number {
    const s = this.admin.stats();
    if (!s) return 0;
    if (putanja === '/admin/prijave') return s.pendingReports;
    if (putanja === '/admin/lekari') return s.unverifiedDoctors;
    return 0;
  }

  async odjaviSe() {
    await this.auth.signOut();
    this.admin.isAdmin.set(false);
    this.router.navigateByUrl('/');
  }

  readonly ShieldIcon = Shield;
  readonly LogOutIcon = LogOut;
  readonly MenuIcon = Menu;
  readonly XIcon = X;
}
