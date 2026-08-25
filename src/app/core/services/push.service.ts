import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { PUSH_JAVNI_KLJUC } from '../config/push.config';

export type StanjePusha =
  | 'nepodrzano'      // pregledač nema Push API
  | 'treba-instalirati' // iPhone u Safari tabu: mora na početni ekran
  | 'nije-trazeno'
  | 'odbijeno'
  | 'ukljuceno';

/**
 * Push notifikacije.
 *
 * Na iPhone-u Web Push radi tek od iOS 16.4 i to isključivo kad je aplikacija
 * dodata na početni ekran — u običnom Safari tabu Push API ne postoji. Zato se
 * taj slučaj razdvaja od „nepodržano": ženi treba reći da doda prečicu, a ne
 * da njen telefon ne može.
 */
@Injectable({ providedIn: 'root' })
export class PushService {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);

  readonly stanje = signal<StanjePusha>('nije-trazeno');
  readonly radi = signal(false);

  /** Safari na iOS-u van početnog ekrana nema Push API uopšte. */
  private jeIosBezPrecice(): boolean {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const uPrecici = (navigator as any).standalone === true
      || window.matchMedia('(display-mode: standalone)').matches;
    return ios && !uPrecici;
  }

  async procitajStanje(): Promise<StanjePusha> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      const s: StanjePusha = this.jeIosBezPrecice() ? 'treba-instalirati' : 'nepodrzano';
      this.stanje.set(s);
      return s;
    }

    const dozvola = Notification.permission;
    const s: StanjePusha =
      dozvola === 'granted' ? 'ukljuceno' : dozvola === 'denied' ? 'odbijeno' : 'nije-trazeno';
    this.stanje.set(s);
    return s;
  }

  /**
   * Traži dozvolu i upisuje pretplatu.
   *
   * Zove se tek kad postoji povod (npr. posle zakazivanja pregleda). Ko odbije,
   * na iOS-u se teško predomisli — dozvola se posle traži kroz podešavanja
   * telefona, ne kroz aplikaciju.
   */
  async ukljuci(): Promise<StanjePusha> {
    if (await this.procitajStanje() === 'nepodrzano') return 'nepodrzano';
    if (this.stanje() === 'treba-instalirati') return 'treba-instalirati';

    this.radi.set(true);
    try {
      const dozvola = await Notification.requestPermission();
      if (dozvola !== 'granted') {
        this.stanje.set(dozvola === 'denied' ? 'odbijeno' : 'nije-trazeno');
        return this.stanje();
      }

      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const pretplata = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.uBajtove(PUSH_JAVNI_KLJUC),
      });

      await this.sacuvaj(pretplata);
      this.stanje.set('ukljuceno');
      return 'ukljuceno';
    } finally {
      this.radi.set(false);
    }
  }

  async iskljuci() {
    const reg = await navigator.serviceWorker.getRegistration();
    const pretplata = await reg?.pushManager.getSubscription();
    if (pretplata) {
      await this.supabase.client
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', pretplata.endpoint);
      await pretplata.unsubscribe();
    }
    this.stanje.set('nije-trazeno');
  }

  private async sacuvaj(p: PushSubscription) {
    const korisnik = this.auth.user();
    if (!korisnik) return;

    const json: any = p.toJSON();
    // `endpoint` je jedinstven, pa obnovljena pretplata zameni staru umesto
    // da uređaj dobije dva zapisa i dve iste notifikacije.
    const { error } = await this.supabase.client.from('push_subscriptions').upsert(
      {
        user_id: korisnik.id,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
      { onConflict: 'endpoint' },
    );
    if (error) throw error;
  }

  /** VAPID ključ je base64url tekst, a pushManager traži bajtove. */
  private uBajtove(kljuc: string): ArrayBuffer {
    const dopuna = '='.repeat((4 - (kljuc.length % 4)) % 4);
    const obican = (kljuc + dopuna).replace(/-/g, '+').replace(/_/g, '/');
    const sirovo = atob(obican);
    const niz = new Uint8Array(sirovo.length);
    for (let i = 0; i < sirovo.length; i++) niz[i] = sirovo.charCodeAt(i);
    return niz.buffer;
  }
}
