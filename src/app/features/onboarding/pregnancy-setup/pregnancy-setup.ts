import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Heart } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { PregnancyService } from '../../../core/services/pregnancy.service';

type Mode = 'lmp' | 'due-date';

@Component({
  selector: 'app-pregnancy-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, UiCard, UiButton],
  templateUrl: './pregnancy-setup.html',
  styleUrls: ['../../auth/register/register.scss', './pregnancy-setup.scss']
})
export class PregnancySetup {
  mode = signal<Mode>('lmp');
  dateInput = '';

  readonly loading = signal(false);
  readonly error = signal('');
  readonly HeartIcon = Heart;

  get computedDueDate(): Date | null {
    if (!this.dateInput) return null;
    const base = new Date(this.dateInput);
    if (this.mode() === 'due-date') return base;
    const due = new Date(base);
    due.setDate(due.getDate() + 280);
    return due;
  }

  get formattedDueDate(): string {
    const d = this.computedDueDate;
    if (!d) return '';
    return d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  setMode(m: Mode) {
    this.mode.set(m);
    this.dateInput = '';
  }

  constructor(private pregnancyService: PregnancyService, private router: Router) {}

  async submit() {
    const due = this.computedDueDate;
    if (!due) {
      this.error.set('Unesi datum da nastaviš.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.pregnancyService.create({
        due_date: due.toISOString().slice(0, 10),
        last_period_date: this.mode() === 'lmp' ? this.dateInput : undefined,
      });
      this.router.navigateByUrl('/home');
    } catch (e: any) {
      this.error.set(e?.message ?? 'Nešto nije u redu, pokušaj ponovo.');
    } finally {
      this.loading.set(false);
    }
  }
}
