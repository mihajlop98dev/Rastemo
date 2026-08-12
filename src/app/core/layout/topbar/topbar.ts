import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Search, Bell, MessageCircle, ChevronDown } from 'lucide-angular';
import { UiAvatar } from '../../../shared/ui/avatar/avatar';
import { currentUser } from '../../data/mock-data';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiAvatar],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class Topbar {
  @Input() title = '';
  @Input() subtitle = '';
  readonly user = currentUser;
  readonly SearchIcon = Search;
  readonly BellIcon = Bell;
  readonly MessageIcon = MessageCircle;
  readonly ChevronIcon = ChevronDown;
}
