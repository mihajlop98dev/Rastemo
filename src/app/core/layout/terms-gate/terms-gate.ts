import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UiButton } from '../../../shared/ui/button/button';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';

/**
 * Nalozi napravljeni pre uvođenja uslova (i oni koji su prihvatili stariju
 * verziju) nemaju upisan pristanak. Ovaj modal stoji preko cele aplikacije dok
 * ga ne prihvate — bez pristanka nema ni pravnog ograđivanja.
 */
@Component({
  selector: 'app-terms-gate',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiButton],
  templateUrl: './terms-gate.html',
  styleUrl: './terms-gate.scss'
})
export class TermsGate implements OnInit {
  readonly open = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  accepted = false;

  constructor(
    private profileSvc: ProfileService,
    private auth: AuthService,
    private router: Router,
  ) {}

  async ngOnInit() {
    if (!this.profileSvc.profile()) await this.profileSvc.load();
    this.open.set(this.profileSvc.needsTermsAcceptance());
  }

  async confirm() {
    if (!this.accepted) {
      this.error.set('Označi polje da bi nastavila.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    try {
      await this.profileSvc.acceptTerms();
      this.open.set(false);
    } catch {
      this.error.set('Nismo uspeli da sačuvamo pristanak. Pokušaj ponovo.');
    } finally {
      this.saving.set(false);
    }
  }

  async logOut() {
    await this.auth.signOut();
    this.router.navigateByUrl('/login');
  }
}
