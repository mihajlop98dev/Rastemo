import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Heart } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { PregnancyService } from '../../../core/services/pregnancy.service';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { bmiCategoryFor, recommendedWeightRangeForWeek, BMI_CATEGORY_LABELS } from '../../../core/data/weight-guidance';
import { GreskaDatuma, Procena, VrstaDatuma, proceni, proveriDatum, terminZa, uIso } from '../../../core/data/datum-trudnoce';
import { porukaGreske } from '../../../core/data/greske';

@Component({
  selector: 'app-pregnancy-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCard, UiButton],
  templateUrl: './pregnancy-setup.html',
  styleUrls: ['../../auth/register/register.scss', './pregnancy-setup.scss']
})
export class PregnancySetup {
  /**
   * Dva koraka u istoj komponenti. Trudnoća se pravi na kraju prvog, pa
   * pregnancyGuard od tada prolazi i drugi korak sme da se preskoči.
   *
   * U drugom koraku se traže samo visina i težina pre trudnoće — jedina dva
   * podatka koja se u ovom trenutku sigurno znaju i koja nešto otključavaju
   * (bez njih preporučeni opseg težine ne može da se izračuna). Pol i ime bebe
   * i porodilište se namerno ne pitaju: u 6. nedelji se ne znaju, pa bi pitanje
   * dalo prazan odgovor. Njih tražimo kasnije, na ekranima gde su u kontekstu.
   */
  readonly step = signal<1 | 2>(1);

  mode = signal<VrstaDatuma>('menstruacija');
  dateInput = '';
  /** Najkasniji datum koji kalendar nudi za menstruaciju — danas. */
  readonly danasIso = uIso(new Date());

  heightInput: number | null = null;
  prePregnancyWeightInput: number | null = null;

  readonly loading = signal(false);
  readonly savingDetails = signal(false);
  readonly error = signal('');
  readonly HeartIcon = Heart;

  constructor(
    private pregnancyService: PregnancyService,
    private profileService: ProfileService,
    private auth: AuthService,
    private router: Router,
  ) {}

  /** Greška za trenutno uneti datum — prikazuje se odmah, pre „Nastavi". */
  get greskaDatuma(): GreskaDatuma | null {
    if (!this.dateInput) return null;
    return proveriDatum(this.mode(), this.dateInput);
  }

  /** Šta će aplikacija pokazati — vidi se pre čuvanja, da korisnica potvrdi. */
  get procena(): Procena | null {
    if (!this.dateInput || this.greskaDatuma) return null;
    return proceni(terminZa(this.mode(), this.dateInput));
  }

  setMode(m: VrstaDatuma) {
    this.mode.set(m);
    this.dateInput = '';
    this.error.set('');
  }

  /** Budući datum upisan kao menstruacija skoro uvek je zapravo termin. */
  tumaciKaoTermin() {
    this.mode.set('termin');
    this.error.set('');
  }

  /** Živa najava rezultata — pokazuje čemu ta dva polja zapravo služe. */
  get previewRange(): string {
    if (!this.heightInput || !this.prePregnancyWeightInput) return '';
    const category = bmiCategoryFor(this.heightInput, this.prePregnancyWeightInput);
    const [min, max] = recommendedWeightRangeForWeek(category, this.prePregnancyWeightInput, 40);
    return `${BMI_CATEGORY_LABELS[category]} — do kraja trudnoće preporučeno ${round(min)}–${round(max)} kg`;
  }

  async submit() {
    const greska = proveriDatum(this.mode(), this.dateInput);
    if (greska) {
      this.error.set(greska.poruka);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.pregnancyService.create({
        due_date: terminZa(this.mode(), this.dateInput),
        last_period_date: this.mode() === 'menstruacija' ? this.dateInput : undefined,
      });
      this.step.set(2);
    } catch (e) {
      this.error.set(porukaGreske(e));
    } finally {
      this.loading.set(false);
    }
  }

  async saveDetails() {
    this.savingDetails.set(true);
    this.error.set('');
    try {
      if (this.heightInput) {
        await this.profileService.update({ height_cm: this.heightInput });
      }
      if (this.prePregnancyWeightInput) {
        await this.pregnancyService.update({ pre_pregnancy_weight_kg: this.prePregnancyWeightInput });
      }
      this.router.navigateByUrl('/home');
    } catch {
      // Ovi podaci nisu obavezni; ako upis padne, ne zadržavamo korisnicu na
      // onboardingu — ista polja stoje i u Profilu i u tabu Težina.
      this.router.navigateByUrl('/home');
    } finally {
      this.savingDetails.set(false);
    }
  }

  skipDetails() {
    this.router.navigateByUrl('/home');
  }

  /** Ekran nema drugi izlaz — bez ovoga je ko nije trudna zaglavljena ovde. */
  async odjaviSe() {
    await this.auth.signOut();
    this.router.navigateByUrl('/');
  }
}

function round(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace('.', ',');
}
