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
import { TopicDetail } from './features/community/topic-detail/topic-detail';
import { MessagesInbox } from './features/messages/inbox/inbox';
import { MessagesThread } from './features/messages/thread/thread';
import { Profile } from './features/profile/profile';
import { Register } from './features/auth/register/register';
import { Login } from './features/auth/login/login';
import { PregnancySetup } from './features/onboarding/pregnancy-setup/pregnancy-setup';
import { authGuard } from './core/guards/auth.guard';
import { pregnancyGuard } from './core/guards/pregnancy.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Landing },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'pregnancy-setup', component: PregnancySetup, canActivate: [authGuard] },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard, pregnancyGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'calendar', component: CalendarPage },
      { path: 'tracking', component: Tracking },
      { path: 'baby-development', component: BabyDevelopment },
      { path: 'doctors', component: Doctors },
      { path: 'community', component: Community },
      { path: 'community/topic/:id', component: TopicDetail },
      { path: 'ai', component: AiAssistant },
      { path: 'preparation', component: Preparation },
      { path: 'appointment/:id', component: AppointmentDetail },
      { path: 'messages', component: MessagesInbox },
      { path: 'messages/:id', component: MessagesThread },
      { path: 'profile', component: Profile },
    ],
  },
  { path: '**', redirectTo: '' },
];
