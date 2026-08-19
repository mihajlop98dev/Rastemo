import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Search, MapPin, SlidersHorizontal, Heart, ChevronDown, Plus, X, BadgeCheck } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiAvatar } from '../../shared/ui/avatar/avatar';
import { UiRating } from '../../shared/ui/rating/rating';
import { UiMedicalNotice } from '../../shared/ui/medical-notice/medical-notice';
import { UiClinicPicker } from '../../shared/ui/clinic-picker/clinic-picker';
import { DoctorService, DoctorRow } from '../../core/services/doctor.service';
import { FavoriteDoctorService } from '../../core/services/favorite-doctor.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCard, UiButton, UiAvatar, UiRating, UiMedicalNotice, UiClinicPicker, RouterLink],
  templateUrl: './doctors.html',
  styleUrl: './doctors.scss'
})
export class Doctors implements OnInit {
  searchTerm = '';
  readonly onlyFavorites = signal(false);
  readonly omiljeni = signal<DoctorRow[]>([]);

  readonly showAdd = signal(false);
  readonly saving = signal(false);
  newName = '';
  newSpecialty = 'Ginekologija i akušerstvo';
  newCity = '';
  newClinicId: string | null = null;

  /** Kad korisnica bira lekara koji je već u registru, ne pravi se novi red —
   *  postojećem se samo dopunjuju grad i ustanova. */
  readonly izabraniIzRegistra = signal<DoctorRow | null>(null);
  readonly predlozi = signal<DoctorRow[]>([]);

  private kucanje?: ReturnType<typeof setTimeout>;
  private kucanjeIme?: ReturnType<typeof setTimeout>;

  constructor(readonly doctorSvc: DoctorService, readonly favoriteSvc: FavoriteDoctorService) {}

  async ngOnInit() {
    await Promise.all([
      this.doctorSvc.loadAll(),
      this.doctorSvc.loadTopRated(),
      this.favoriteSvc.load(),
    ]);
  }

  /** Pretraga ide na server, pa se čeka da korisnica prestane da kuca. */
  onSearch() {
    clearTimeout(this.kucanje);
    this.kucanje = setTimeout(() => {
      this.onlyFavorites.set(false);
      this.doctorSvc.search(this.searchTerm);
    }, 300);
  }

  readonly prikazani = computed(() =>
    this.onlyFavorites() ? this.omiljeni() : this.doctorSvc.all()
  );

  async toggleFavoritesFilter() {
    const uklj = !this.onlyFavorites();
    this.onlyFavorites.set(uklj);
    if (uklj) this.omiljeni.set(await this.doctorSvc.byIds([...this.favoriteSvc.ids()]));
  }

  async toggleFavorite(event: Event, doctorId: string) {
    event.preventDefault();
    event.stopPropagation();
    await this.favoriteSvc.toggle(doctorId);
    if (this.onlyFavorites()) this.omiljeni.set(await this.doctorSvc.byIds([...this.favoriteSvc.ids()]));
  }

  /** Titula i uža specijalizacija dolaze iz registra i ne postoje kod svakog. */
  opis(d: DoctorRow): string {
    return [d.title, d.specialty, d.subspecialty, d.academic_title]
      .filter(Boolean)
      .join(' · ');
  }

  openAdd() {
    this.newName = '';
    this.newSpecialty = 'Ginekologija i akušerstvo';
    this.newCity = '';
    this.newClinicId = null;
    this.izabraniIzRegistra.set(null);
    this.predlozi.set([]);
    this.showAdd.set(true);
  }

  closeAdd() {
    this.showAdd.set(false);
  }

  onNameInput() {
    this.izabraniIzRegistra.set(null);
    clearTimeout(this.kucanjeIme);
    this.kucanjeIme = setTimeout(async () => {
      this.predlozi.set(await this.doctorSvc.predlozi(this.newName));
    }, 300);
  }

  izaberi(d: DoctorRow) {
    this.izabraniIzRegistra.set(d);
    this.newName = d.full_name;
    this.newSpecialty = d.specialty;
    this.newCity = d.city ?? '';
    this.newClinicId = d.clinic_id;
    this.predlozi.set([]);
  }

  ponistiIzbor() {
    this.izabraniIzRegistra.set(null);
    this.newName = '';
  }

  async submitAdd() {
    if (!this.newName || !this.newSpecialty) return;
    this.saving.set(true);
    try {
      const postojeci = this.izabraniIzRegistra();
      if (postojeci) {
        await this.doctorSvc.dopuni(postojeci.id, this.newCity || undefined, this.newClinicId);
      } else {
        await this.doctorSvc.create({
          full_name: this.newName,
          specialty: this.newSpecialty,
          city: this.newCity || undefined,
          clinic_id: this.newClinicId,
        });
      }
      this.showAdd.set(false);
    } finally {
      this.saving.set(false);
    }
  }

  readonly SearchIcon = Search;
  readonly MapPinIcon = MapPin;
  readonly FilterIcon = SlidersHorizontal;
  readonly HeartIcon = Heart;
  readonly ChevronIcon = ChevronDown;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly VerifiedIcon = BadgeCheck;
}
