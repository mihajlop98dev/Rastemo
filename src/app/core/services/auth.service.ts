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
  async signUp(email: string, password: string, fullName: string, username: string) {
    return this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          // Ime pod kojim se potpisuje na forumu; okidač ga prepisuje u profil.
          username,
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

  /** Prepoznaje da li je uneto mejl ili korisničko ime. */
  private jeMejl(s: string): boolean {
    return s.includes('@');
  }

  /**
   * Prijava mejlom ili korisničkim imenom.
   *
   * Kod korisničkog imena posao radi funkcija na serveru: prevod imena u mejl
   * ne sme da bude javan, jer korisnička imena stoje na forumu pa bi se preko
   * njih došlo do adresa svih korisnica.
   */
  async prijaviSe(unos: string, lozinka: string): Promise<{ error: { message: string } | null }> {
    const cist = unos.trim();

    if (this.jeMejl(cist)) {
      const { error } = await this.signIn(cist, lozinka);
      return { error: error ? { message: error.message } : null };
    }

    const { data, error } = await this.supabase.client.functions.invoke(
      'prijava-korisnickim-imenom',
      { body: { korisnicko_ime: cist, lozinka } },
    );

    if (error || !data?.access_token) {
      return { error: { message: 'Korisničko ime ili lozinka nisu tačni.' } };
    }

    // Sesija stiže kao par tokena; ovim se upisuje u pregledač kao i obično.
    const { error: greskaSesije } = await this.supabase.client.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    return { error: greskaSesije ? { message: greskaSesije.message } : null };
  }

  /** Da li je korisničko ime slobodno i ispravno. */
  async korisnickoImeSlobodno(ime: string): Promise<boolean> {
    const { data } = await this.supabase.client.rpc('korisnicko_ime_slobodno', { p_ime: ime });
    return data === true;
  }

  private static readonly KLJUC_POVRATKA = 'dnevnik-povratak';

  /**
   * Google prijava.
   *
   * Adresa na koju se vraća mora da bude na spisku dozvoljenih u Supabase
   * podešavanjima, pa se povratna putanja ne šalje kroz nju nego se ostavlja
   * u pregledaču. Tako obećanje „vratićemo te na temu" važi i za ovaj put
   * prijave, bez diranja podešavanja projekta.
   */
  async signInWithGoogle(nazad?: string | null) {
    if (nazad && nazad.startsWith('/') && !nazad.startsWith('//')) {
      sessionStorage.setItem(AuthService.KLJUC_POVRATKA, nazad);
    } else {
      sessionStorage.removeItem(AuthService.KLJUC_POVRATKA);
    }

    return this.supabase.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/home' },
    });
  }

  /** Vraća i briše zapamćenu putanju; koristi se jednom, posle povratka. */
  uzmiPovratak(): string | null {
    const p = sessionStorage.getItem(AuthService.KLJUC_POVRATKA);
    if (p) sessionStorage.removeItem(AuthService.KLJUC_POVRATKA);
    return p;
  }

  async signOut() {
    return this.supabase.client.auth.signOut();
  }
}
