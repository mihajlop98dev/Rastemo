import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, AlertTriangle, Search } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiAvatar } from '../../shared/ui/avatar/avatar';
import { UiTabs, UiTabItem } from '../../shared/ui/tabs/tabs';
import { currentUser } from '../../core/data/mock-data';

interface SymptomEntry {
  name: string;
  emoji: string;
  level: 1 | 2 | 3;
}

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, UiButton, UiAvatar, UiTabs],
  templateUrl: './tracking.html',
  styleUrl: './tracking.scss'
})
export class Tracking {
  readonly user = currentUser;

  readonly tabs: UiTabItem[] = [
    { id: 'simptomi', label: 'Simptomi' },
    { id: 'raspolozenje', label: 'Raspoloženje' },
    { id: 'tezina', label: 'Težina' },
    { id: 'beleske', label: 'Beleške' },
  ];
  activeTab = 'simptomi';

  readonly symptoms: SymptomEntry[] = [
    { name: 'Mučnina', emoji: '🤢', level: 1 },
    { name: 'Umor', emoji: '😴', level: 2 },
    { name: 'Bol u leđima', emoji: '🦴', level: 2 },
    { name: 'Nadutost', emoji: '🌾', level: 1 },
  ];

  readonly levels = [1, 2, 3] as const;

  readonly trendDays = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
  readonly trendValues = [1, 2, 2, 3, 2, 1, 2];

  get trendPoints(): string {
    const w = 280, h = 90, pad = 10;
    const max = 3, min = 1;
    return this.trendValues
      .map((v, i) => {
        const x = pad + (i * (w - pad * 2)) / (this.trendValues.length - 1);
        const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }

  readonly PlusIcon = Plus;
  readonly AlertIcon = AlertTriangle;
  readonly SearchIcon = Search;
}
