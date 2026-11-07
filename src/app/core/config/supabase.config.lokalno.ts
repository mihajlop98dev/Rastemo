/**
 * Lokalna Supabase baza (Docker, `npx supabase start`) — samo za testiranje.
 * Koristi se jedino kroz `npm run lokalno`; produkcioni build je ne vidi.
 * Ključ je javni demo ključ lokalne instance, nije tajna.
 */
export const supabaseConfig = {
  url: 'http://127.0.0.1:54321',
  anonKey: 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
};
