import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShoppingBag, Sparkles, Check } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiProgressBar } from '../../shared/ui/progress-bar/progress-bar';
import { UiTabs, UiTabItem } from '../../shared/ui/tabs/tabs';

interface ChecklistItem {
  label: string;
  done: boolean;
}

interface ChecklistGroup {
  title: string;
  items: ChecklistItem[];
}

@Component({
  selector: 'app-preparation',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, UiProgressBar, UiTabs],
  templateUrl: './preparation.html',
  styleUrl: './preparation.scss'
})
export class Preparation {
  readonly tabs: UiTabItem[] = [
    { id: 'porodiliste', label: 'Torba za porodilište' },
    { id: 'kupovina', label: 'Kupovina za bebu' },
    { id: 'porodjaj', label: 'Plan porođaja' },
    { id: 'kuca', label: 'Prvi dani kod kuće' },
  ];
  activeTab = 'porodiliste';

  readonly groups = signal<ChecklistGroup[]>([
    {
      title: 'Za mamu',
      items: [
        { label: 'Dokumenta (lična karta, zdravstvena knjižica)', done: true },
        { label: 'Odeća za mamu', done: true },
        { label: 'Higijena', done: false },
        { label: 'Ostalo', done: false },
      ],
    },
    {
      title: 'Za bebu',
      items: [
        { label: 'Bodići i pidžamice', done: true },
        { label: 'Pelene i vlažne maramice', done: true },
        { label: 'Ćebence za izlazak iz porodilišta', done: false },
        { label: 'Kapica i čarapice', done: false },
        { label: 'Auto sedište', done: false },
      ],
    },
    {
      title: 'Dokumenta i ostalo',
      items: [
        { label: 'Zdravstveno osiguranje bebe', done: true },
        { label: 'Punjač za telefon', done: false },
        { label: 'Grickalice i voda za partnera', done: false },
      ],
    },
  ]);

  readonly totalCount = computed(() => this.groups().reduce((n, g) => n + g.items.length, 0));
  readonly doneCount = computed(() => this.groups().reduce((n, g) => n + g.items.filter(i => i.done).length, 0));
  readonly progress = computed(() => Math.round((this.doneCount() / this.totalCount()) * 100));

  toggle(group: ChecklistGroup, item: ChecklistItem) {
    this.groups.update(gs =>
      gs.map(g =>
        g === group
          ? { ...g, items: g.items.map(i => (i === item ? { ...i, done: !i.done } : i)) }
          : g
      )
    );
  }

  readonly BagIcon = ShoppingBag;
  readonly SparklesIcon = Sparkles;
  readonly CheckIcon = Check;
}
