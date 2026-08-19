import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Heart, CheckCircle2 } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { AuthService } from '../../../core/services/auth.service';
import { PregnancyService } from '../../../core/services/pregnancy.service';

@Component({
  selector: 'app-confirmed',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiButton],
  templateUrl: './confirmed.html',
  styleUrl: '../register/register.scss'
})
export class Confirmed implements OnInit {
  readonly checking = signal(true);
  readonly prijavljena = signal(false);

  readonly HeartIcon = Heart;
  readonly CheckIcon = CheckCircle2;

  constructor(
    private auth: AuthService,
    private router: Router,
    private pregnancySvc: PregnancyService,
  ) {}

  /**
   * Link iz mejla potvrđuje nalog i usput prijavljuje korisnicu. Ako je sve
   * prošlo, nema razloga da je zaustavljamo — vodimo je pravo tamo gde je stala.
   */
  async ngOnInit() {
    await this.auth.waitUntilReady();
    const ima = !!this.auth.session();
    this.prijavljena.set(ima);
    this.checking.set(false);

    if (!ima) return;

    await this.pregnancySvc.load();
    this.router.navigateByUrl(this.pregnancySvc.active() ? '/home' : '/pregnancy-setup');
  }
}
