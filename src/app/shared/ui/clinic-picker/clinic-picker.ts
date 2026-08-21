import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Search, Plus, X, Check } from 'lucide-angular';
import { ClinicService, ClinicRow } from '../../../core/services/clinic.service';

/**
 * Biranje zdravstvene ustanove iz liste, uz mogućnost da korisnica doda svoju
 * ako je nema — seed pokriva porodilišta, ali ne i privatne ordinacije.
 *
 * Radi kao obična kontrola: `value` je clinic_id (ili null), a `valueChange`
 * javlja izbor roditeljskoj komponenti.
 */
@Component({
  selector: 'ui-clinic-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
  templateUrl: './clinic-picker.html',
  styleUrl: './clinic-picker.scss'
})
export class UiClinicPicker implements OnInit {
  @Input() value: string | null = null;
  @Input() label = 'Ustanova';
  @Input() placeholder = 'Pretraži porodilišta i ordinacije...';
  @Output() valueChange = new EventEmitter<string | null>();

  readonly open = signal(false);
  readonly error = signal('');

  term = '';


  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly CheckIcon = Check;

  constructor(readonly clinics: ClinicService) {}

  async ngOnInit() {
    await this.clinics.load();
  }

  get selected(): ClinicRow | null {
    return this.clinics.byId(this.value);
  }

  get results(): ClinicRow[] {
    return this.clinics.search(this.term).slice(0, 40);
  }

  toggleOpen() {
    this.open.update(v => !v);
  }

  choose(clinic: ClinicRow) {
    this.value = clinic.id;
    this.valueChange.emit(clinic.id);
    this.open.set(false);
    this.term = '';
  }

  clear(event: Event) {
    event.stopPropagation();
    this.value = null;
    this.valueChange.emit(null);
  }

  /** Ime koje je već ukucano u pretragu prenosi se u formu za dodavanje. */


}
