import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';

/**
 * Prijavljenu korisnicu sa naslovne vodi pravo u aplikaciju.
 *
 * Bez ovoga bi žena koja svakog jutra otvara sajt prvo dobijala reklamnu stranu
 * sa dugmetom „Otvori svoj dnevnik" — iako ga je odavno otvorila.
 */
export const pocetnaGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const admin = inject(AdminService);
  const router = inject(Router);

  await auth.waitUntilReady();
  if (!auth.session()) return true;

  router.navigateByUrl(await admin.checkAdmin() ? '/admin' : '/home');
  return false;
};
