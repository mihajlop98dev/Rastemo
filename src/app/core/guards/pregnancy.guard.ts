import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PregnancyService } from '../services/pregnancy.service';

export const pregnancyGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const pregnancy = inject(PregnancyService);
  const router = inject(Router);

  await auth.waitUntilReady();

  if (!pregnancy.active() && !pregnancy.loading()) {
    await pregnancy.load();
  }

  if (pregnancy.active()) return true;

  router.navigate(['/pregnancy-setup']);
  return false;
};
