import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Prijavljenu korisnicu sa naslovne vodi pravo u aplikaciju.
 *
 * Bez ovoga bi žena koja svakog jutra otvara sajt prvo dobijala reklamnu stranu
 * sa dugmetom „Otvori svoj dnevnik" — iako ga je odavno otvorila.
 */
export const pocetnaGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.waitUntilReady();
  if (!auth.session()) return true;

  router.navigateByUrl('/home');
  return false;
};
