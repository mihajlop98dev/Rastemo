import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, Bell, ShoppingCart, CircleHelp, Heart, MapPin, Clock } from 'lucide-angular';
import { UiCard } from '../../shared/ui/card/card';
import { UiButton } from '../../shared/ui/button/button';
import { UiProgressBar } from '../../shared/ui/progress-bar/progress-bar';
import { currentUser, nextAppointment, upcomingAppointments } from '../../core/data/mock-data';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiButton, UiProgressBar],
  templateUrl: './appointment-detail.html',
  styleUrl: './appointment-detail.scss'
})
export class AppointmentDetail {
  readonly user = currentUser;
  appointment = nextAppointment;

  readonly partnerTips = [
    { icon: Bell, text: 'Podseti je na pregled dan ranije.' },
    { icon: ShoppingCart, text: 'Pomozi oko kupovine za bebu.' },
    { icon: CircleHelp, text: 'Pripremi zajedno pitanja za lekara.' },
    { icon: Heart, text: 'Pročitaj šta se ove nedelje dešava sa bebom.' },
  ];

  readonly weekProgress = Math.round((this.user.weekNumber / this.user.totalWeeks) * 100);

  readonly MapPinIcon = MapPin;
  readonly ClockIcon = Clock;

  constructor(route: ActivatedRoute) {
    route.paramMap.subscribe(params => {
      const id = params.get('id');
      const found = upcomingAppointments.find(a => a.id === id);
      if (found) this.appointment = found;
    });
  }
}
