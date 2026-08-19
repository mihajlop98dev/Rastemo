import { Routes } from '@angular/router';
import { Shell } from './core/layout/shell/shell';
import { Landing } from './features/landing/landing';
import { Home } from './features/home/home';
import { CalendarPage } from './features/calendar/calendar';
import { Tracking } from './features/tracking/tracking';
import { BabyDevelopment } from './features/baby-development/baby-development';
import { Doctors } from './features/doctors/doctors';
import { DoctorDetail } from './features/doctors/doctor-detail/doctor-detail';
import { Community } from './features/community/community';
import { Preparation } from './features/preparation/preparation';
import { AppointmentDetail } from './features/appointment/appointment-detail';
import { TopicDetail } from './features/community/topic-detail/topic-detail';
import { MessagesInbox } from './features/messages/inbox/inbox';
import { MessagesThread } from './features/messages/thread/thread';
import { Profile } from './features/profile/profile';
import { Admin } from './features/admin/admin';
import { Register } from './features/auth/register/register';
import { Login } from './features/auth/login/login';
import { CheckEmail } from './features/auth/check-email/check-email';
import { Confirmed } from './features/auth/confirmed/confirmed';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { NewPassword } from './features/auth/new-password/new-password';
import { PregnancySetup } from './features/onboarding/pregnancy-setup/pregnancy-setup';
import { LegalPage } from './features/legal/legal-page';
import { authGuard } from './core/guards/auth.guard';
import { pregnancyGuard } from './core/guards/pregnancy.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Landing },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'proveri-mejl', component: CheckEmail },
  { path: 'potvrda', component: Confirmed },
  { path: 'zaboravljena-lozinka', component: ForgotPassword },
  // Bez guarda: ovde se stiže iz mejla, a sesija za oporavak se uspostavi tek
  // pošto supabase-js pročita token iz adrese.
  { path: 'nova-lozinka', component: NewPassword },
  { path: 'uslovi-koriscenja', component: LegalPage, data: { doc: 'terms' } },
  { path: 'politika-privatnosti', component: LegalPage, data: { doc: 'privacy' } },
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
      { path: 'doctors/:id', component: DoctorDetail },
      { path: 'community', component: Community },
      { path: 'community/topic/:id', component: TopicDetail },
      { path: 'preparation', component: Preparation },
      { path: 'appointment/:id', component: AppointmentDetail },
      { path: 'messages', component: MessagesInbox },
      { path: 'messages/:id', component: MessagesThread },
      { path: 'profile', component: Profile },
      { path: 'admin', component: Admin, canActivate: [adminGuard] },
    ],
  },
  { path: '**', redirectTo: '' },
];
