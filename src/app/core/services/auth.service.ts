import { Injectable, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(null);
  readonly user = signal<User | null>(null);
  readonly ready = signal(false);

  private readonly initPromise: Promise<void>;

  constructor(private supabase: SupabaseService) {
    this.initPromise = this.supabase.client.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.user.set(data.session?.user ?? null);
      this.ready.set(true);
    });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
    });
  }

  /** Resolves once the initial session restore (from storage) has completed. */
  async waitUntilReady(): Promise<void> {
    if (this.ready()) return;
    await this.initPromise;
  }

  async signUp(email: string, password: string, fullName: string) {
    return this.supabase.client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
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
