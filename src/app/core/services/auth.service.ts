import { Injectable, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { TERMS_VERSION } from '../data/legal';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(null);
  readonly user = signal<User | null>(null);
  readonly ready = signal(false);

  private readonly initPromise: Promise<void>;

  constructor(private supabase: SupabaseService) {
    // Wait for onAuthStateChange's first event rather than calling getSession()
    // independently: on an OAuth redirect, supabase-js parses the access token out
    // of the URL asynchronously, and the first auth event is only fired once that
    // finishes. Resolving readiness from a separate getSession() call can race
    // ahead of that and briefly report "no session" right after Google login.
    let resolveReady!: () => void;
    this.initPromise = new Promise<void>((resolve) => { resolveReady = resolve; });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
      if (!this.ready()) {
        this.ready.set(true);
        resolveReady();
      }
    });
  }

  /** Resolves once the initial session restore (from storage) has completed. */
  async waitUntilReady(): Promise<void> {
    if (this.ready()) return;
    await this.initPromise;
  }

  /**
   * Sa uključenom potvrdom mejla signUp ne vraća sesiju, pa aplikacija posle
   * registracije ne može ništa da upiše u bazu. Zato prihvatanje uslova putuje
   * kroz metapodatke — okidač handle_new_user ih prepisuje u profil.
   */
  async signUp(email: string, password: string, fullName: string) {
    return this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          terms_version: TERMS_VERSION,
          terms_accepted_at: new Date().toISOString(),
        },
        emailRedirectTo: `${window.location.origin}/potvrda`,
      },
    });
  }

  /** Ponovno slanje mejla za potvrdu, ako prvi ne stigne. */
  async resendConfirmation(email: string) {
    return this.supabase.client.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/potvrda` },
    });
  }

  /** Šalje link za postavljanje nove lozinke. */
  async sendPasswordReset(email: string) {
    return this.supabase.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-lozinka`,
    });
  }

  /**
   * Menja lozinku prijavljenoj korisnici. Isti poziv radi i posle klika na link
   * iz mejla, jer Supabase tada uspostavi privremenu sesiju za oporavak.
   */
  async updatePassword(password: string) {
    return this.supabase.client.auth.updateUser({ password });
  }

  async signIn(email: string, password: string) {
    return this.supabase.client.auth.signInWithPassword({ email, password });
  }

  async signInWithGoogle() {
    return this.supabase.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/home' },
    });
  }

  async signOut() {
    return this.supabase.client.auth.signOut();
  }
}
