import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Heart, BadgeCheck, Trash2, MessageCircle } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { UiAvatar } from '../../../shared/ui/avatar/avatar';
import { UiRating } from '../../../shared/ui/rating/rating';
import { UiMedicalNotice } from '../../../shared/ui/medical-notice/medical-notice';
import { DoctorService, DoctorRow } from '../../../core/services/doctor.service';
import { DoctorReviewService, OcenaRow } from '../../../core/services/doctor-review.service';
import { FavoriteDoctorService } from '../../../core/services/favorite-doctor.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, UiCard, UiButton, UiAvatar, UiRating, UiMedicalNotice],
  templateUrl: './doctor-detail.html',
  styleUrl: './doctor-detail.scss'
})
export class DoctorDetail implements OnInit {
  readonly lekar = signal<DoctorRow | null>(null);
  readonly ucitavam = signal(true);

  // --- moja ocena ---
  readonly formaOtvorena = signal(false);
  readonly cuvam = signal(false);
  readonly greska = signal('');
  ocena = 0;
  komentar = '';
  anonimno = false;

  // --- komentari na tuđe ocene ---
  readonly otvorenaOcena = signal<string | null>(null);
  noviKomentar = '';
  komentarAnoniman = false;
  readonly saljemKomentar = signal(false);

  readonly zvezdice = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private doctorSvc: DoctorService,
    readonly reviewSvc: DoctorReviewService,
    readonly favoriteSvc: FavoriteDoctorService,
    private profileSvc: ProfileService,
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const [d] = await this.doctorSvc.byIds([id]);
    this.lekar.set(d ?? null);
    this.ucitavam.set(false);

    await Promise.all([this.reviewSvc.load(id), this.favoriteSvc.load()]);

    // Ako je već ocenila, forma se otvara sa njenim vrednostima.
    const moja = this.reviewSvc.moja;
    if (moja) {
      this.ocena = moja.rating;
      this.komentar = moja.comment ?? '';
      this.anonimno = moja.is_anonymous;
    } else {
      this.anonimno = this.profileSvc.profile()?.default_anonymous ?? false;
    }
  }

  opis(d: DoctorRow): string {
    return [d.title, d.specialty, d.subspecialty, d.academic_title].filter(Boolean).join(' · ');
  }

  async sacuvaj() {
    const d = this.lekar();
    if (!d || !this.ocena) {
      this.greska.set('Izaberi ocenu od 1 do 5.');
      return;
    }

    this.cuvam.set(true);
    this.greska.set('');
    try {
      await this.reviewSvc.sacuvaj(d.id, this.ocena, this.komentar, this.anonimno);
      this.formaOtvorena.set(false);
      // Prosek se menja okidačem u bazi, pa se kartica lekara osvežava.
      const [svez] = await this.doctorSvc.byIds([d.id]);
      if (svez) this.lekar.set(svez);
    } catch {
      this.greska.set('Nismo uspeli da sačuvamo ocenu. Pokušaj ponovo.');
    } finally {
      this.cuvam.set(false);
    }
  }

  async obrisiMoju(reviewId: string) {
    const d = this.lekar();
    if (!d) return;
    await this.reviewSvc.obrisi(d.id, reviewId);
    this.ocena = 0;
    this.komentar = '';
    const [svez] = await this.doctorSvc.byIds([d.id]);
    if (svez) this.lekar.set(svez);
  }

  async prikaziKomentare(o: OcenaRow) {
    if (this.otvorenaOcena() === o.id) {
      this.otvorenaOcena.set(null);
      return;
    }
    this.otvorenaOcena.set(o.id);
    this.noviKomentar = '';
    this.komentarAnoniman = this.profileSvc.profile()?.default_anonymous ?? false;
    await this.reviewSvc.ucitajKomentare(o.id);
  }

  async posaljiKomentar(reviewId: string) {
    if (!this.noviKomentar.trim() || this.saljemKomentar()) return;
    this.saljemKomentar.set(true);
    try {
      await this.reviewSvc.dodajKomentar(reviewId, this.noviKomentar, this.komentarAnoniman);
      this.noviKomentar = '';
    } finally {
      this.saljemKomentar.set(false);
    }
  }

  datum(iso: string): string {
    const d = new Date(iso);
    return `${`${d.getDate()}`.padStart(2, '0')}.${`${d.getMonth() + 1}`.padStart(2, '0')}.${d.getFullYear()}.`;
  }

  readonly BackIcon = ArrowLeft;
  readonly HeartIcon = Heart;
  readonly VerifiedIcon = BadgeCheck;
  readonly TrashIcon = Trash2;
  readonly CommentIcon = MessageCircle;
}
