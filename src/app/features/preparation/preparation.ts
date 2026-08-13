import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShoppingBag, Sparkles, Check } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiProgressBar } from '../../shared/ui/progress-bar/progress-bar';
import { UiTabs, UiTabItem } from '../../shared/ui/tabs/tabs';
import { PregnancyService } from '../../core/services/pregnancy.service';
import { ChecklistService, ChecklistItemRow } from '../../core/services/checklist.service';

const DEFAULT_ITEMS_BY_TYPE: Record<string, { group_name: string; label: string }[]> = {
  porodiliste: [
    { group_name: 'Za mamu', label: 'Dokumenta (lična karta, zdravstvena knjižica)' },
    { group_name: 'Za mamu', label: 'Odeća za mamu' },
    { group_name: 'Za mamu', label: 'Higijena' },
    { group_name: 'Za mamu', label: 'Ostalo' },
    { group_name: 'Za bebu', label: 'Bodići i pidžamice' },
    { group_name: 'Za bebu', label: 'Pelene i vlažne maramice' },
    { group_name: 'Za bebu', label: 'Ćebence za izlazak iz porodilišta' },
    { group_name: 'Za bebu', label: 'Kapica i čarapice' },
    { group_name: 'Za bebu', label: 'Auto sedište' },
    { group_name: 'Dokumenta i ostalo', label: 'Zdravstveno osiguranje bebe' },
    { group_name: 'Dokumenta i ostalo', label: 'Punjač za telefon' },
    { group_name: 'Dokumenta i ostalo', label: 'Grickalice i voda za partnera' },
  ],
  kupovina: [
    { group_name: 'Za spavanje', label: 'Krevetac i dušek' },
    { group_name: 'Za spavanje', label: 'Posteljina' },
    { group_name: 'Za spavanje', label: 'Vreća za spavanje' },
    { group_name: 'Za hranjenje', label: 'Flašice i cucle' },
    { group_name: 'Za hranjenje', label: 'Sterilizator' },
    { group_name: 'Za hranjenje', label: 'Stolica za hranjenje' },
    { group_name: 'Za negu', label: 'Kadica za kupanje' },
    { group_name: 'Za negu', label: 'Peškiri sa kapuljačom' },
    { group_name: 'Za negu', label: 'Kozmetika i termometar' },
    { group_name: 'Za šetnju', label: 'Kolica' },
    { group_name: 'Za šetnju', label: 'Nosiljka' },
    { group_name: 'Za šetnju', label: 'Auto sedište' },
  ],
  porodjaj: [
    { group_name: 'Pre porođaja', label: 'Odabrati porodilište' },
    { group_name: 'Pre porođaja', label: 'Razgovarati sa lekarom o planu porođaja' },
    { group_name: 'Pre porođaja', label: 'Odlučiti ko je prisutan na porođaju' },
    { group_name: 'Tokom porođaja', label: 'Odluka o epiduralnoj analgeziji' },
    { group_name: 'Tokom porođaja', label: 'Odluka o prisustvu partnera' },
    { group_name: 'Tokom porođaja', label: 'Pripremiti plejlistu/muziku' },
    { group_name: 'Posle porođaja', label: 'Kontakt koža na kožu' },
    { group_name: 'Posle porođaja', label: 'Odluka o dojenju' },
    { group_name: 'Posle porođaja', label: 'Informisati porodicu' },
  ],
  kuca: [
    { group_name: 'Priprema doma', label: 'Spremiti sobu za bebu' },
    { group_name: 'Priprema doma', label: 'Nabaviti osnovne namirnice unapred' },
    { group_name: 'Priprema doma', label: 'Pripremiti obroke za zamrzavanje' },
    { group_name: 'Podrška', label: 'Dogovoriti pomoć porodice ili prijatelja' },
    { group_name: 'Podrška', label: 'Organizovati posete u prvim nedeljama' },
    { group_name: 'Zdravlje bebe', label: 'Zakazati prvi pedijatrijski pregled' },
    { group_name: 'Zdravlje bebe', label: 'Proveriti raspored vakcinacije' },
    { group_name: 'Zdravlje bebe', label: 'Sačuvati kontakt pedijatra u telefonu' },
  ],
};

const TITLE_BY_TYPE: Record<string, string> = {
  porodiliste: 'Torba za porodilište',
  kupovina: 'Kupovina za bebu',
  porodjaj: 'Plan porođaja',
  kuca: 'Prvi dani kod kuće',
};

@Component({
  selector: 'app-preparation',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, UiProgressBar, UiTabs],
  templateUrl: './preparation.html',
  styleUrl: './preparation.scss'
})
export class Preparation implements OnInit {
  readonly tabs: UiTabItem[] = [
    { id: 'porodiliste', label: 'Torba za porodilište' },
    { id: 'kupovina', label: 'Kupovina za bebu' },
    { id: 'porodjaj', label: 'Plan porođaja' },
    { id: 'kuca', label: 'Prvi dani kod kuće' },
  ];
  activeTab = 'porodiliste';

  constructor(private pregnancy: PregnancyService, readonly checklistSvc: ChecklistService) {}

  async ngOnInit() {
    await this.loadTab(this.activeTab);
  }

  async selectTab(tabId: string) {
    this.activeTab = tabId;
    await this.loadTab(tabId);
  }

  private async loadTab(type: string) {
    const p = this.pregnancy.active();
    if (p) await this.checklistSvc.loadOrCreate(p.id, type, TITLE_BY_TYPE[type], DEFAULT_ITEMS_BY_TYPE[type]);
  }

  get currentTitle(): string {
    return TITLE_BY_TYPE[this.activeTab];
  }

  readonly totalCount = computed(() => this.checklistSvc.items().length);
  readonly doneCount = computed(() => this.checklistSvc.items().filter(i => i.is_done).length);
  readonly progress = computed(() => this.totalCount() ? Math.round((this.doneCount() / this.totalCount()) * 100) : 0);

  toggle(item: ChecklistItemRow) {
    this.checklistSvc.toggle(item);
  }

  readonly BagIcon = ShoppingBag;
  readonly SparklesIcon = Sparkles;
  readonly CheckIcon = Check;
}
