import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User, Baby, Heart, Bell, Shield, FileDown, Pencil, MapPin, Mail, Cake, Scale } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiAvatar } from '../../shared/ui/avatar/avatar';
import { currentUser } from '../../core/data/mock-data';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, UiButton, UiAvatar],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  readonly user = currentUser;

  readonly menu = [
    { label: 'Moj profil', icon: User, active: true },
    { label: 'Trudnoća', icon: Baby, active: false },
    { label: 'Partner', icon: Heart, active: false },
    { label: 'Notifikacije', icon: Bell, active: false },
    { label: 'Privatnost', icon: Shield, active: false },
    { label: 'Izveštaj podataka', icon: FileDown, active: false },
  ];

  readonly infoFields = [
    { icon: MapPin, label: 'Lokacija', value: this.user.city },
    { icon: Mail, label: 'Email', value: this.user.email },
    { icon: Cake, label: 'Datum rođenja', value: this.user.birthDate },
    { icon: Scale, label: 'Visina / Težina', value: '168 cm / ' + this.user.weight },
  ];

  readonly PencilIcon = Pencil;
}
