import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Shield, Trash2, Check, X, AlertTriangle, Search, BadgeCheck } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiTabs, UiTabItem } from '../../shared/ui/tabs/tabs';
import { AdminService, AdminContentRow, AdminUserRow, STRIKE_LIMIT } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { DoctorService } from '../../core/services/doctor.service';

type Section = 'pregled' | 'prijave' | 'zajednica' | 'korisnice' | 'lekari' | 'dnevnik';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCard, UiButton, UiTabs],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  readonly tabs: UiTabItem[] = [
    { id: 'pregled', label: 'Pregled' },
    { id: 'prijave', label: 'Prijave' },
    { id: 'zajednica', label: 'Zajednica' },
    { id: 'korisnice', label: 'Korisnice' },
    { id: 'lekari', label: 'Lekari' },
    { id: 'dnevnik', label: 'Dnevnik' },
  ];
  activeTab: Section = 'pregled';

  readonly STRIKE_LIMIT = STRIKE_LIMIT;

  contentSearch = '';
  userSearch = '';

  /** Sadržaj koji se briše — modal traži razlog pre nego što se išta obriše. */
  readonly removing = signal<AdminContentRow | null>(null);
  removeReason = '';
  readonly removingBusy = signal(false);

  /** Nalog koji se briše; brisanje je nepovratno pa ide kroz potvrdu. */
  readonly deletingUser = signal<AdminUserRow | null>(null);
  readonly deletingBusy = signal(false);

  readonly ShieldIcon = Shield;
  readonly TrashIcon = Trash2;
  readonly CheckIcon = Check;
  readonly XIcon = X;
  readonly AlertIcon = AlertTriangle;
  readonly SearchIcon = Search;
  readonly VerifiedIcon = BadgeCheck;

  constructor(
    readonly admin: AdminService,
    readonly doctorSvc: DoctorService,
    private auth: AuthService,
    private router: Router,
  ) {}

  async logOut() {
    await this.auth.signOut();
    this.admin.isAdmin.set(false);
    this.router.navigateByUrl('/login');
  }

  async ngOnInit() {
    this.admin.loading.set(true);
    await Promise.all([
      this.admin.loadStats(),
      this.admin.loadUsers(),
      this.admin.loadContent(),
      this.admin.loadReports(),
      this.admin.loadActions(),
      this.doctorSvc.loadUserAdded(),
    ]);
    this.admin.loading.set(false);
  }

  get filteredContent(): AdminContentRow[] {
    const t = this.contentSearch.trim().toLowerCase();
    const list = this.admin.content();
    if (!t) return list;
    return list.filter(c =>
      c.body.toLowerCase().includes(t) ||
      (c.title ?? '').toLowerCase().includes(t) ||
      c.author_name.toLowerCase().includes(t)
    );
  }

  get filteredUsers(): AdminUserRow[] {
    const t = this.userSearch.trim().toLowerCase();
    const list = this.admin.users();
    if (!t) return list;
    return list.filter(u => (u.full_name ?? '').toLowerCase().includes(t) || (u.city ?? '').toLowerCase().includes(t));
  }

  get usersAtLimit(): AdminUserRow[] {
    return this.admin.users().filter(u => u.strikes >= STRIKE_LIMIT);
  }

  get pendingReports() {
    return this.admin.reports().filter(r => r.status === 'pending');
  }

  get unverifiedDoctors() {
    return this.doctorSvc.userAdded().filter(d => !d.is_verified);
  }

  /**
   * Anonimne objave ostaju anonimne u običnom pregledu; ime se prikazuje tek
   * kad je objava prijavljena ili kad se briše, jer tada mora da postoji trag
   * ko je autor.
   */
  displayAuthor(item: AdminContentRow, reveal = false): string {
    if (item.is_anonymous && !reveal) return 'Anonimno';
    return item.author_name;
  }

  startRemove(item: AdminContentRow) {
    this.removeReason = '';
    this.removing.set(item);
  }

  cancelRemove() {
    this.removing.set(null);
  }

  async confirmRemove() {
    const item = this.removing();
    if (!item || !this.removeReason.trim()) return;

    this.removingBusy.set(true);
    try {
      await this.admin.removeContent(item, this.removeReason.trim());
      this.removing.set(null);
    } finally {
      this.removingBusy.set(false);
    }
  }

  startDeleteUser(user: AdminUserRow) {
    this.deletingUser.set(user);
  }

  cancelDeleteUser() {
    this.deletingUser.set(null);
  }

  async confirmDeleteUser() {
    const user = this.deletingUser();
    if (!user) return;

    this.deletingBusy.set(true);
    try {
      await this.admin.deleteUser(user.id);
      this.deletingUser.set(null);
    } finally {
      this.deletingBusy.set(false);
    }
  }

  async toggleVerified(doctorId: string, current: boolean) {
    await this.admin.setDoctorVerified(doctorId, !current);
    await this.doctorSvc.loadUserAdded();
    await this.admin.loadStats();
  }

  async removeDoctor(doctorId: string) {
    await this.admin.deleteDoctor(doctorId);
    await this.doctorSvc.loadUserAdded();
    await this.admin.loadStats();
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    const day = `${d.getDate()}`.padStart(2, '0');
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    return `${day}.${month}.${d.getFullYear()}.`;
  }

  excerpt(text: string, max = 160): string {
    return text.length > max ? text.slice(0, max) + '…' : text;
  }
}
