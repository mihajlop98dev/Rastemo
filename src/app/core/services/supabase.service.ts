import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase.config';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  /**
   * Podešavanja sesije stoje ovde izričito, iako su ovo i podrazumevane
   * vrednosti — od njih zavisi da li žena mora ponovo da se prijavljuje.
   *
   * `persistSession` čuva sesiju u localStorage, a `autoRefreshToken` je
   * produžava u pozadini pre nego što istekne. Bez toga bi pristupni token
   * istekao za sat vremena.
   */
  readonly client: SupabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
