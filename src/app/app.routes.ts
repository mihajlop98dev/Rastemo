import { Routes } from '@angular/router';
import { Shell } from './core/layout/shell/shell';
import { authGuard } from './core/guards/auth.guard';
import { pregnancyGuard } from './core/guards/pregnancy.guard';
import { adminGuard } from './core/guards/admin.guard';
import { pocetnaGuard } from './core/guards/pocetna.guard';

export const routes: Routes = [
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then(c => c.Register) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(c => c.Login) },

  // Javni deo sajta — namerno bez guarda: ove stranice postoje da bi ih otvorio
  // neko ko još nema nalog, i da bi ih pretraživači indeksirali.
  //
  // Učitavaju se tek kad se otvore: posetiteljka koja sa pretrage dođe na jednu
  // nedelju vodiča ne treba da skine celu aplikaciju da bi je pročitala.
  {
    path: '',
    loadComponent: () => import('./features/javno/layout/layout').then(m => m.JavniLayout),
    children: [
      // Početna je sada javni sajt, ne splash ekran: ko dođe sa pretrage ili
      // deljenog linka odmah vidi sadržaj, a ne zid sa dugmetom za prijavu.
      { path: '', pathMatch: 'full', canActivate: [pocetnaGuard], loadComponent: () => import('./features/javno/pocetna/pocetna').then(m => m.JavnaPocetna) },
      { path: 'trudnoca', loadComponent: () => import('./features/vodic/spisak/spisak').then(m => m.VodicSpisak) },
      { path: 'trudnoca/:nedelja', loadComponent: () => import('./features/vodic/nedelja/nedelja').then(m => m.VodicNedelja) },
      { path: 'kalkulator-termina', loadComponent: () => import('./features/javno/kalkulator/kalkulator').then(m => m.Kalkulator) },
      { path: 'imena', loadComponent: () => import('./features/javno/imena/imena').then(m => m.Imena) },
      { path: 'imena/:ime', loadComponent: () => import('./features/javno/imena-detalj/imena-detalj').then(m => m.ImeDetalj) },
      { path: 'kalkulator-zaceca', loadComponent: () => import('./features/javno/kalkulator-zaceca/kalkulator-zaceca').then(m => m.KalkulatorZaceca) },
      { path: 'ime-uz-prezime', loadComponent: () => import('./features/javno/ime-uz-prezime/ime-uz-prezime').then(m => m.ImeUzPrezime) },
      { path: 'odbrojavanje', loadComponent: () => import('./features/javno/odbrojavanje/odbrojavanje').then(m => m.Odbrojavanje) },
      { path: 'zajednica', loadComponent: () => import('./features/community/community').then(c => c.Community) },
      { path: 'zajednica/tema/:id', loadComponent: () => import('./features/community/topic-detail/topic-detail').then(c => c.TopicDetail) },
      { path: 'anketa-imena', loadComponent: () => import('./features/javno/anketa-imena/anketa-imena').then(m => m.AnketaImena) },
      { path: 'anketa-imena/:kod', loadComponent: () => import('./features/javno/anketa-imena/anketa-imena').then(m => m.AnketaImena) },
      { path: 'zabava', loadComponent: () => import('./features/javno/zabava/zabava').then(m => m.Zabava) },
      { path: 'pol-bebe', loadComponent: () => import('./features/javno/pol-bebe/pol-bebe').then(m => m.PolBebe) },
      { path: 'kineski-horoskop', loadComponent: () => import('./features/javno/kineski-horoskop/kineski-horoskop').then(m => m.KineskiHoroskop) },
      { path: 'horoskopski-znak', loadComponent: () => import('./features/javno/horoskopski-znak/horoskopski-znak').then(m => m.HoroskopskiZnak) },
      { path: 'porodilista', loadComponent: () => import('./features/javno/porodilista/porodilista').then(m => m.Porodilista) },
      { path: 'cesta-pitanja', loadComponent: () => import('./features/javno/pitanja/pitanja').then(m => m.Pitanja) },
      { path: 'o-nama', loadComponent: () => import('./features/javno/o-nama/o-nama').then(m => m.ONama) },
      { path: 'kontakt', loadComponent: () => import('./features/javno/kontakt/kontakt').then(m => m.Kontakt) },
    ],
  },
  { path: 'proveri-mejl', loadComponent: () => import('./features/auth/check-email/check-email').then(c => c.CheckEmail) },
  { path: 'potvrda', loadComponent: () => import('./features/auth/confirmed/confirmed').then(c => c.Confirmed) },
  { path: 'zaboravljena-lozinka', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(c => c.ForgotPassword) },
  // Bez guarda: ovde se stiže iz mejla, a sesija za oporavak se uspostavi tek
  // pošto supabase-js pročita token iz adrese.
  { path: 'nova-lozinka', loadComponent: () => import('./features/auth/new-password/new-password').then(c => c.NewPassword) },
  { path: 'uslovi-koriscenja', loadComponent: () => import('./features/legal/legal-page').then(c => c.LegalPage), data: { doc: 'terms' } },
  { path: 'politika-privatnosti', loadComponent: () => import('./features/legal/legal-page').then(c => c.LegalPage), data: { doc: 'privacy' } },
  { path: 'pregnancy-setup', loadComponent: () => import('./features/onboarding/pregnancy-setup/pregnancy-setup').then(c => c.PregnancySetup), canActivate: [authGuard] },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard, pregnancyGuard],
    children: [
      { path: 'home', loadComponent: () => import('./features/home/home').then(c => c.Home) },
      { path: 'calendar', loadComponent: () => import('./features/calendar/calendar').then(c => c.CalendarPage) },
      { path: 'tracking', loadComponent: () => import('./features/tracking/tracking').then(c => c.Tracking) },
      { path: 'baby-development', loadComponent: () => import('./features/baby-development/baby-development').then(c => c.BabyDevelopment) },
      { path: 'doctors', loadComponent: () => import('./features/doctors/doctors').then(c => c.Doctors) },
      { path: 'doctors/:id', loadComponent: () => import('./features/doctors/doctor-detail/doctor-detail').then(c => c.DoctorDetail) },
      // Forum je sada javan; stare adrese ostaju kao preusmerenje.
      { path: 'community', redirectTo: '/zajednica', pathMatch: 'full' },
      { path: 'community/topic/:id', redirectTo: '/zajednica/tema/:id' },
      { path: 'preparation', loadComponent: () => import('./features/preparation/preparation').then(c => c.Preparation) },
      { path: 'appointment/:id', loadComponent: () => import('./features/appointment/appointment-detail').then(c => c.AppointmentDetail) },
      { path: 'messages', loadComponent: () => import('./features/messages/inbox/inbox').then(c => c.MessagesInbox) },
      { path: 'messages/:id', loadComponent: () => import('./features/messages/thread/thread').then(c => c.MessagesThread) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile').then(c => c.Profile) },
    ],
  },

  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/layout/admin-layout').then(c => c.AdminLayout),
    children: [
      { path: '', loadComponent: () => import('./features/admin/pregled/admin-pregled').then(c => c.AdminPregled) },
      { path: 'prijave', data: { sekcija: 'prijave' }, loadComponent: () => import('./features/admin/admin').then(c => c.Admin) },
      { path: 'zajednica', data: { sekcija: 'zajednica' }, loadComponent: () => import('./features/admin/admin').then(c => c.Admin) },
      { path: 'korisnice', data: { sekcija: 'korisnice' }, loadComponent: () => import('./features/admin/admin').then(c => c.Admin) },
      { path: 'lekari', data: { sekcija: 'lekari' }, loadComponent: () => import('./features/admin/admin').then(c => c.Admin) },
      { path: 'imena', data: { sekcija: 'imena' }, loadComponent: () => import('./features/admin/admin').then(c => c.Admin) },
      { path: 'dnevnik', data: { sekcija: 'dnevnik' }, loadComponent: () => import('./features/admin/admin').then(c => c.Admin) },
    ],
  },

  // Prava stranica sa porukom, a ne tiho preusmeravanje na početnu:
  // preusmereni 404 pretraživači vide kao grešku u sadržaju.
  { path: '**', loadComponent: () => import('./features/javno/nema-strane/nema-strane').then(m => m.NemaStrane) },
];
