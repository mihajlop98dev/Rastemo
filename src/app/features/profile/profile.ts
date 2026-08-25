import { Component, OnInit, signal } from '@angular/core';
import { LOKAL } from '../../core/data/lokalizacija';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, User, Baby, Bell, Shield, FileDown, Pencil, MapPin, Mail, Cake, Scale, Check, X, Download, LogOut, ScrollText, Lock } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiAvatar } from '../../shared/ui/avatar/avatar';
import { UiClinicPicker } from '../../shared/ui/clinic-picker/clinic-picker';
import { ClinicService } from '../../core/services/clinic.service';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { PregnancyService, BabyGender } from '../../core/services/pregnancy.service';
import { NotificationService } from '../../core/services/notification.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { AnalyticsService } from '../../core/services/analytics.service';

type Section = 'profil' | 'trudnoca' | 'notifikacije' | 'privatnost' | 'lozinka' | 'izvestaj';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiButton, UiAvatar, UiClinicPicker],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  readonly menu: { id: Section; label: string; icon: any }[] = [
    { id: 'profil', label: 'Moj profil', icon: User },
    { id: 'trudnoca', label: 'Trudnoća', icon: Baby },
    { id: 'notifikacije', label: 'Notifikacije', icon: Bell },
    { id: 'privatnost', label: 'Privatnost', icon: Shield },
    { id: 'lozinka', label: 'Lozinka', icon: Lock },
    { id: 'izvestaj', label: 'Izveštaj podataka', icon: FileDown },
  ];

  activeSection: Section = 'profil';

  // --- merenje poseta ---
  // Data saglasnost mora da se povuče isto tako lako kao što je data.
  promeniPristanak(prihvata: boolean) {
    prihvata ? this.analytics.prihvati() : this.analytics.odbij();
  }

  // --- promena lozinke ---
  novaLozinka = '';
  potvrdaLozinke = '';
  readonly menjamLozinku = signal(false);
  readonly lozinkaGreska = signal('');
  readonly lozinkaSacuvana = signal(false);

  async promeniLozinku() {
    this.lozinkaSacuvana.set(false);

    if (this.novaLozinka.length < 6) {
      this.lozinkaGreska.set('Lozinka mora imati bar 6 karaktera.');
      return;
    }
    if (this.novaLozinka !== this.potvrdaLozinke) {
      this.lozinkaGreska.set('Lozinke se ne poklapaju.');
      return;
    }

    this.menjamLozinku.set(true);
    this.lozinkaGreska.set('');
    const { error } = await this.auth.updatePassword(this.novaLozinka);
    this.menjamLozinku.set(false);

    if (error) {
      this.lozinkaGreska.set(
        error.message.toLowerCase().includes('should be different')
          ? 'Nova lozinka mora da se razlikuje od stare.'
          : error.message
      );
      return;
    }

    this.novaLozinka = '';
    this.potvrdaLozinke = '';
    this.lozinkaSacuvana.set(true);
  }


  readonly editing = signal(false);
  readonly saving = signal(false);

  editName = '';
  editCity = '';
  editBirthDate = '';
  editHeight: number | null = null;
  editWeight: number | null = null;

  readonly editingPregnancy = signal(false);
  readonly savingPregnancy = signal(false);
  editDueDate = '';
  editLastPeriod = '';
  editConceptionMethod: 'natural' | 'ivf' = 'natural';
  editBabyName = '';
  editBabyGender: BabyGender = 'nepoznato';
  editPrePregnancyWeight: number | null = null;
  editBirthFacilityId: string | null = null;

  readonly exporting = signal(false);
  readonly loggingOut = signal(false);

  constructor(
    private auth: AuthService,
    private supabase: SupabaseService,
    private router: Router,
    readonly profileSvc: ProfileService,
    readonly pregnancy: PregnancyService,
    readonly notifications: NotificationService,
    readonly clinics: ClinicService,
    readonly analytics: AnalyticsService,
  ) {}

  async ngOnInit() {
    if (!this.profileSvc.profile()) await this.profileSvc.load();
    await Promise.all([this.notifications.load(), this.clinics.load()]);
  }

  selectSection(id: Section) {
    this.activeSection = id;
  }

  get email(): string {
    return this.auth.user()?.email ?? '';
  }

  startEdit() {
    const p = this.profileSvc.profile();
    this.editName = p?.full_name ?? '';
    this.editCity = p?.city ?? '';
    this.editBirthDate = p?.birth_date ?? '';
    this.editHeight = p?.height_cm ?? null;
    this.editWeight = p?.weight_kg ?? null;
    this.editing.set(true);
  }

  cancelEdit() {
    this.editing.set(false);
  }

  async saveEdit() {
    this.saving.set(true);
    try {
      await this.profileSvc.update({
        full_name: this.editName,
        city: this.editCity || null,
        birth_date: this.editBirthDate || null,
        height_cm: this.editHeight,
        weight_kg: this.editWeight,
      });
      this.editing.set(false);
    } finally {
      this.saving.set(false);
    }
  }

  startEditPregnancy() {
    const p = this.pregnancy.active();
    this.editDueDate = p?.due_date ?? '';
    this.editLastPeriod = p?.last_period_date ?? '';
    this.editConceptionMethod = p?.conception_method ?? 'natural';
    this.editBabyName = p?.baby_name ?? '';
    this.editBabyGender = p?.baby_gender ?? 'nepoznato';
    this.editPrePregnancyWeight = p?.pre_pregnancy_weight_kg ?? null;
    this.editBirthFacilityId = p?.birth_facility_id ?? null;
    this.editingPregnancy.set(true);
  }

  cancelEditPregnancy() {
    this.editingPregnancy.set(false);
  }

  async savePregnancy() {
    if (!this.editDueDate) return;
    this.savingPregnancy.set(true);
    try {
      await this.pregnancy.update({
        due_date: this.editDueDate,
        last_period_date: this.editLastPeriod || null,
        conception_method: this.editConceptionMethod,
        baby_name: this.editBabyName.trim() || null,
        baby_gender: this.editBabyGender,
        pre_pregnancy_weight_kg: this.editPrePregnancyWeight,
        birth_facility_id: this.editBirthFacilityId,
      });
      this.editingPregnancy.set(false);
    } finally {
      this.savingPregnancy.set(false);
    }
  }

  /** Evropski brojčani zapis: 12.03.1998. */
  formatDateShort(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    const day = `${d.getDate()}`.padStart(2, '0');
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    return `${day}.${month}.${d.getFullYear()}.`;
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(LOKAL, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diffMs / 3_600_000);
    if (hours < 1) return 'upravo sada';
    if (hours < 24) return `pre ${hours}h`;
    const days = Math.floor(hours / 24);
    return `pre ${days}d`;
  }

  async markNotificationRead(id: string) {
    await this.notifications.markRead(id);
  }

  async markAllNotificationsRead() {
    await this.notifications.markAllRead();
  }

  async toggleDefaultAnonymous() {
    const current = this.profileSvc.profile()?.default_anonymous ?? false;
    await this.profileSvc.update({ default_anonymous: !current });
  }

  async downloadReport() {
    const userId = this.auth.user()?.id;
    if (!userId) return;

    this.exporting.set(true);
    try {
      const pregnancyId = this.pregnancy.active()?.id;

      const [symptoms, moods, weights, diary, appointments, topics] = await Promise.all([
        pregnancyId ? this.supabase.client.from('symptom_entries').select('*').eq('pregnancy_id', pregnancyId) : Promise.resolve({ data: [] }),
        pregnancyId ? this.supabase.client.from('mood_entries').select('*').eq('pregnancy_id', pregnancyId) : Promise.resolve({ data: [] }),
        pregnancyId ? this.supabase.client.from('weight_entries').select('*').eq('pregnancy_id', pregnancyId) : Promise.resolve({ data: [] }),
        pregnancyId ? this.supabase.client.from('diary_entries').select('*').eq('pregnancy_id', pregnancyId) : Promise.resolve({ data: [] }),
        pregnancyId ? this.supabase.client.from('appointments').select('*').eq('pregnancy_id', pregnancyId) : Promise.resolve({ data: [] }),
        // Kroz pogled: filtriranje po author_id traži pravo čitanja te kolone,
        // koje je oduzeto da anonimne teme ne bi mogle da se povežu sa autorom.
        this.supabase.client.from('forum_teme_v').select('*').eq('moja', true),
      ]);

      const report = {
        exported_at: new Date().toISOString(),
        profile: this.profileSvc.profile(),
        pregnancy: this.pregnancy.active(),
        symptoms: symptoms.data,
        moods: moods.data,
        weights: weights.data,
        diary_entries: diary.data,
        appointments: appointments.data,
        forum_topics: topics.data,
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dnevnik-trudnoce-podaci-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      this.exporting.set(false);
    }
  }

  async logOut() {
    this.loggingOut.set(true);
    try {
      await this.auth.signOut();
      // Posle odjave ide javni sajt, ne prazna forma za prijavu — žena koja se
      // odjavila najčešće nije htela da se odmah ponovo prijavi.
      this.router.navigateByUrl('/');
    } finally {
      this.loggingOut.set(false);
    }
  }

  readonly MapPinIcon = MapPin;
  readonly MailIcon = Mail;
  readonly CakeIcon = Cake;
  readonly ScaleIcon = Scale;
  readonly PencilIcon = Pencil;
  readonly CheckIcon = Check;
  readonly XIcon = X;
  readonly DownloadIcon = Download;
  readonly LogOutIcon = LogOut;
  readonly ScrollIcon = ScrollText;
  readonly LockIcon = Lock;
}
