import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, MapPin, SlidersHorizontal, Heart, ChevronDown, Plus } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiAvatar } from '../../shared/ui/avatar/avatar';
import { UiRating } from '../../shared/ui/rating/rating';
import { doctors } from '../../core/data/mock-data';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, UiButton, UiAvatar, UiRating],
  templateUrl: './doctors.html',
  styleUrl: './doctors.scss'
})
export class Doctors {
  readonly doctors = doctors;
  readonly topRated = [...doctors].sort((a, b) => b.rating - a.rating);

  readonly SearchIcon = Search;
  readonly MapPinIcon = MapPin;
  readonly FilterIcon = SlidersHorizontal;
  readonly HeartIcon = Heart;
  readonly ChevronIcon = ChevronDown;
  readonly PlusIcon = Plus;
}
