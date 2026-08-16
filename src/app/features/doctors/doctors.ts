import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, MapPin, SlidersHorizontal, Heart, ChevronDown, Plus, X } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiAvatar } from '../../shared/ui/avatar/avatar';
import { UiRating } from '../../shared/ui/rating/rating';
import { UiMedicalNotice } from '../../shared/ui/medical-notice/medical-notice';
import { UiClinicPicker } from '../../shared/ui/clinic-picker/clinic-picker';
import { DoctorService } from '../../core/services/doctor.service';
import { FavoriteDoctorService } from '../../core/services/favorite-doctor.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCard, UiButton, UiAvatar, UiRating, UiMedicalNotice, UiClinicPicker],
  templateUrl: './doctors.html',
  styleUrl: './doctors.scss'
})
export class Doctors implements OnInit {
  searchTerm = '';
  onlyFavorites = false;

  readonly showAdd = signal(false);
  readonly saving = signal(false);
  newName = '';
  newSpecialty = 'Ginekolog';
  newCity = '';
  newClinicId: string | null = null;

  constructor(readonly doctorSvc: DoctorService, readonly favoriteSvc: FavoriteDoctorService) {}

  async ngOnInit() {
    await Promise.all([this.doctorSvc.loadAll(), this.favoriteSvc.load()]);
  }

  get filtered() {
    const term = this.searchTerm.trim().toLowerCase();
    let list = this.doctorSvc.all();
    if (this.onlyFavorites) list = list.filter(d => this.favoriteSvc.isFavorite(d.id));
    if (!term) return list;
    return list.filter(d =>
      d.full_name.toLowerCase().includes(term) ||
      d.city?.toLowerCase().includes(term) ||
      d.specialty.toLowerCase().includes(term)
    );
  }

  toggleFavorite(event: Event, doctorId: string) {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteSvc.toggle(doctorId);
  }

  get topRated() {
    return [...this.doctorSvc.all()].sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 5);
  }

  openAdd() {
    this.newName = '';
    this.newSpecialty = 'Ginekolog';
    this.newCity = '';
    this.newClinicId = null;
    this.showAdd.set(true);
  }

  closeAdd() {
    this.showAdd.set(false);
  }

  async submitAdd() {
    if (!this.newName || !this.newSpecialty) return;
    this.saving.set(true);
    try {
      await this.doctorSvc.create({
        full_name: this.newName,
        specialty: this.newSpecialty,
        city: this.newCity || undefined,
        clinic_id: this.newClinicId,
      });
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
}
