import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

/**
 * Administratora sa Početne vodi u panel.
 *
 * Admin nema svoju trudnoću, pa bi na /home gledao tuđu bebu i praznu
 * nedelju — ekran koji za njega ne znači ništa. Do /home se dolazi sa
 * više strana (koren sajta, povratak sa Google prijave, stara adresa u
 * istoriji), pa je provera ovde, na samoj ruti, umesto na svakom ulazu.
 */
export const adminPocetnaGuard: CanActivateFn = async () => {
  const admin = inject(AdminService);
  const router = inject(Router);

  if (await admin.checkAdmin()) {
    router.navigateByUrl('/admin');
    return false;
  }
  return true;
};
