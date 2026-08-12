import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (!auth.ready()) {
    await supabase.client.auth.getSession();
  }

  if (auth.user()) return true;

  router.navigate(['/prijava']);
  return false;
};
