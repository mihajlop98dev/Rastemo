import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Plus, MessageCircle, Pin, EyeOff } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiAvatar } from '../../shared/ui/avatar/avatar';
import { UiTabs, UiTabItem } from '../../shared/ui/tabs/tabs';
import { forumTopics, forumCategories } from '../../core/data/mock-data';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, UiButton, UiBadge, UiAvatar, UiTabs],
  templateUrl: './community.html',
  styleUrl: './community.scss'
})
export class Community {
  readonly topics = forumTopics;
  readonly categories = forumCategories;

  readonly tabs: UiTabItem[] = [
    { id: 'forumi', label: 'Forumi' },
    { id: 'pratim', label: 'Pratim' },
    { id: 'moje', label: 'Moje teme' },
  ];
  activeTab = 'forumi';

  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly MessageIcon = MessageCircle;
  readonly PinIcon = Pin;
  readonly AnonIcon = EyeOff;
}
