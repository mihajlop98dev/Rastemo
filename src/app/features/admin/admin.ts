import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Shield, Trash2, Check, X, AlertTriangle, Search, BadgeCheck } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiTabs, UiTabItem } from '../../shared/ui/tabs/tabs';
import { AdminService, AdminContentRow, AdminUserRow, STRIKE_LIMIT } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../core/services/doctor.service';
import { SupabaseService } from '../../core/services/supabase.service';

interface PredlozenoIme {
  id: string;
  ime: string;
  broj_unosa: number;
  prvi_put: string;
  poslednji_put: string;
  obradjeno: boolean;
}

type Section = 'pregled' | 'prijave' | 'zajednica' | 'korisnice' | 'aktivnost' | 'lekari' | 'imena' | 'dnevnik';

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
    { id: 'imena', label: 'Predložena imena' },
    { id: 'dnevnik', label: 'Dnevnik' },
  ];
  activeTab: Section = 'pregled';

  private route = inject(ActivatedRoute);

  /** Naslov stranice; menja se uz sekciju iz adrese. */
  readonly naslovi: Record<string, { naslov: string; opis: string }> = {
    prijave: { naslov: 'Prijave', opis: 'Sadržaj koji su korisnice prijavile.' },
    zajednica: { naslov: 'Zajednica', opis: 'Teme i odgovori na forumu.' },
    korisnice: { naslov: 'Korisnice', opis: 'Nalozi, opomene i brisanje.' },
    aktivnost: { naslov: 'Aktivnost', opis: 'Ko se vraća u aplikaciju, a ko je otvorio nalog i nestao.' },
    lekari: { naslov: 'Lekari', opis: 'Unosi korisnica koji čekaju proveru.' },
    imena: { naslov: 'Predložena imena', opis: 'Imena upisana u ankete kojih nema na spisku.' },
    dnevnik: { naslov: 'Dnevnik rada', opis: 'Šta je i kada urađeno u panelu.' },
  };

  get naslovSekcije() {
    return this.naslovi[this.activeTab] ?? { naslov: 'Administracija', opis: '' };
  }

  readonly STRIKE_LIMIT = STRIKE_LIMIT;

  // --- imena koja su korisnice upisale u ankete, a nema ih na spisku ---
  readonly predlozenaImena = signal<PredlozenoIme[]>([]);
  readonly ucitavamImena = signal(false);
  prikaziObradjena = false;

  async ucitajPredlozena() {
    this.ucitavamImena.set(true);
    let upit = this.supabase.client
      .from('predlozena_imena')
      .select('*')
      .order('broj_unosa', { ascending: false })
      .limit(200);
    if (!this.prikaziObradjena) upit = upit.eq('obradjeno', false);

    const { data } = await upit;
    this.predlozenaImena.set((data as PredlozenoIme[]) ?? []);
    this.ucitavamImena.set(false);
  }

  /** Označava da je ime prebačeno u spisak, da se ne obrađuje dvaput. */
  async oznaciObradjeno(id: string, obradjeno: boolean) {
    await this.supabase.client
      .from('predlozena_imena')
      .update({ obradjeno })
      .eq('id', id);
    await this.ucitajPredlozena();
  }

  contentSearch = '';
  userSearch = '';

  /** Filter po vrsti sadrzaja u Zajednici. */
  contentKind: 'sve' | 'topic' | 'post' = 'sve';
  /** Redosled korisnica; podrazumevano najnovije jer se najcesce trazi ko se skoro registrovao. */
  userSort: 'novo' | 'staro' | 'opomene' = 'novo';

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
    private supabase: SupabaseService,
  ) {}

  async logOut() {
    await this.auth.signOut();
    this.admin.isAdmin.set(false);
    // Isto kao iz profila: posle odjave ide javni sajt, ne forma za prijavu.
    this.router.navigateByUrl('/');
  }

  async ngOnInit() {
    const sekcija = this.route.snapshot.data['sekcija'] as Section | undefined;
    if (sekcija) this.activeTab = sekcija;

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

    // Aktivnost ide zasebno: upit prolazi kroz desetak tabela, pa ne treba da
    // usporava otvaranje ostalih sekcija.
    if (this.activeTab === 'aktivnost') await this.admin.loadAktivnost();
  }

  get filteredContent(): AdminContentRow[] {
    const t = this.contentSearch.trim().toLowerCase();
    let list = this.admin.content();
    if (this.contentKind !== 'sve') list = list.filter(c => c.kind === this.contentKind);
    if (!t) return list;
    return list.filter(c =>
      c.body.toLowerCase().includes(t) ||
      (c.title ?? '').toLowerCase().includes(t) ||
      c.author_name.toLowerCase().includes(t)
    );
  }

  get filteredUsers(): AdminUserRow[] {
    const t = this.userSearch.trim().toLowerCase();
    let list = this.admin.users();
    if (t) {
      list = list.filter(u =>
        (u.full_name ?? '').toLowerCase().includes(t) ||
        (u.city ?? '').toLowerCase().includes(t) ||
        (u.username ?? '').toLowerCase().includes(t)
      );
    }
    // Kopija pre sortiranja — sort menja niz u mestu, a ovo je signal iz servisa.
    const kopija = [...list];
    if (this.userSort === 'opomene') {
      return kopija.sort((a, b) => b.strikes - a.strikes);
    }
    const smer = this.userSort === 'novo' ? -1 : 1;
    return kopija.sort((a, b) =>
      smer * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
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

  /** Koliko je dana prošlo; null kad datuma nema. */
  danaOd(iso: string | null): number | null {
    if (!iso) return null;
    return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  }

  /**
   * Stanje naloga u jednoj reči.
   *
   * Granice su namerno grube — poenta je da se na prvi pogled razdvoji ko se
   * vraća od onog ko je otvorio nalog i nestao, a ne precizno merenje.
   */
  stanje(r: { poslednja_aktivnost: string | null; poslednja_prijava: string | null }):
    { oznaka: string; ton: string } {
    const dana = this.danaOd(r.poslednja_aktivnost ?? r.poslednja_prijava);
    if (dana === null) return { oznaka: 'Nikad nije ušla', ton: 'mrtva' };
    if (dana <= 7)  return { oznaka: 'Aktivna', ton: 'ziva' };
    if (dana <= 30) return { oznaka: 'Usporila', ton: 'mlaka' };
    return { oznaka: 'Otišla', ton: 'mrtva' };
  }

  /** Sažetak za vrh sekcije. */
  get sazetakAktivnosti() {
    const svi = this.admin.aktivnost();
    const broj = (t: string) => svi.filter(r => this.stanje(r).ton === t).length;
    return {
      ukupno: svi.length,
      aktivnih: svi.filter(r => this.stanje(r).oznaka === 'Aktivna').length,
      usporile: svi.filter(r => this.stanje(r).oznaka === 'Usporila').length,
      otisle:   svi.filter(r => this.stanje(r).oznaka === 'Otišla').length,
      nikad:    svi.filter(r => this.stanje(r).oznaka === 'Nikad nije ušla').length,
    };
  }

  /** „pre 3 dana" umesto golog datuma — ovde je razmak važniji od datuma. */
  preKoliko(iso: string | null): string {
    const d = this.danaOd(iso);
    if (d === null) return '—';
    if (d === 0) return 'danas';
    if (d === 1) return 'juče';
    if (d < 31) return `pre ${d} dana`;
    const m = Math.floor(d / 30);
    return m === 1 ? 'pre mesec dana' : `pre ${m} meseca`;
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
