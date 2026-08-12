import { Routes } from '@angular/router';
import { Shell } from './core/layout/shell/shell';
import { Landing } from './features/landing/landing';
import { Home } from './features/home/home';
import { CalendarPage } from './features/calendar/calendar';
import { Tracking } from './features/tracking/tracking';
import { BabyDevelopment } from './features/baby-development/baby-development';
import { Doctors } from './features/doctors/doctors';
import { Community } from './features/community/community';
import { AiAssistant } from './features/ai-assistant/ai-assistant';
import { Preparation } from './features/preparation/preparation';
import { AppointmentDetail } from './features/appointment/appointment-detail';
import { Profile } from './features/profile/profile';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Landing },
  {
    path: '',
    component: Shell,
    children: [
      { path: 'pocetna', component: Home },
      { path: 'kalendar', component: CalendarPage },
      { path: 'pracenje', component: Tracking },
      { path: 'razvoj-bebe', component: BabyDevelopment },
      { path: 'lekari', component: Doctors },
      { path: 'zajednica', component: Community },
      { path: 'ai', component: AiAssistant },
      { path: 'priprema', component: Preparation },
      { path: 'pregled/:id', component: AppointmentDetail },
      { path: 'profil', component: Profile },
    ],
  },
  { path: '**', redirectTo: '' },
];
