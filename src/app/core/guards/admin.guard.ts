import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';

/**
 * Uloga se proverava u bazi pri svakom ulasku, ne iz keša — ovo je jedina
 * prepreka do ekrana za moderaciju, pa ne sme da zavisi od stanja koje je
 * moglo da ostane iz prethodne sesije.
 */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const admin = inject(AdminService);
  const router = inject(Router);

  await auth.waitUntilReady();

  if (!auth.user()) {
    router.navigateByUrl('/login');
    return false;
  }

  if (await admin.checkAdmin()) return true;

  router.navigateByUrl('/home');
  return false;
};
