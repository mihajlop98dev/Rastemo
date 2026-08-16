import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PregnancyService } from '../services/pregnancy.service';
import { AdminService } from '../services/admin.service';

export const pregnancyGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const pregnancy = inject(PregnancyService);
  const admin = inject(AdminService);
  const router = inject(Router);

  await auth.waitUntilReady();

  // Administrator nema svoju trudnoću i ne treba mu onboarding — bez ovoga bi
  // ga guard vrteo na /pregnancy-setup i nikad ga ne bi pustio u panel.
  if (await admin.checkAdmin()) return true;

  if (!pregnancy.active() && !pregnancy.loading()) {
    await pregnancy.load();
  }

  // Immediately after an OAuth redirect, the Supabase client can briefly use a
  // stale/not-yet-persisted session for the very first authenticated request,
  // making a real active pregnancy look like it doesn't exist. Retry once
  // before concluding the user needs onboarding.
  if (!pregnancy.active()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await pregnancy.load();
  }

  if (pregnancy.active()) return true;

  router.navigate(['/pregnancy-setup']);
  return false;
};
