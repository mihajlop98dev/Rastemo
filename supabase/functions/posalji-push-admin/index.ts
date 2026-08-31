/**
 * Push administratoru kad se neko registruje.
 *
 * Poziva je okidač iz baze, odmah po upisu profila, preko pg_net. Zato nema
 * `verify_jwt`: zakazani poslovi i okidači ne šalju korisnički token. Umesto
 * toga se dole poredi zaglavlje sa service_role ključem iz okruženja same
 * funkcije — isti ključ koji okidač čita iz Vault-a.
 *
 * Šalje se svim administratorima i moderatorima koji imaju registrovan
 * uređaj, ne samo jednom — da obaveštenje ne zavisi od toga ko je tog dana
 * prijavljen na kom telefonu.
 */
import { baza, posalji, proveriKljuceve, poslednjiOpis } from '../_shared/push.ts';

const VERZIJA = 'v1';
const SERVIS_KLJUC = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const odgovor = (telo: unknown, status = 200) =>
  new Response(JSON.stringify(telo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  const greskaKljuceva = proveriKljuceve();
  if (greskaKljuceva) return odgovor({ greska: greskaKljuceva, verzija: VERZIJA }, 500);

  // Bez ove provere bi bilo ko mogao da zaspe administratora izmišljenim
  // registracijama. Poređenje je po celoj dužini, ne po prefiksu.
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
  if (!SERVIS_KLJUC || token !== SERVIS_KLJUC) {
    return odgovor({ greska: 'Nije dozvoljeno.' }, 401);
  }

  let userId = '';
  try {
    userId = (await req.json())?.user_id ?? '';
  } catch {
    return odgovor({ greska: 'Telo zahteva nije ispravno.' }, 400);
  }
  if (!userId) return odgovor({ greska: 'Nedostaje user_id.' }, 400);

  const { data: nova } = await baza
    .from('profiles')
    .select('full_name, city, username, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (!nova) return odgovor({ greska: 'Profil ne postoji.' }, 404);

  const { data: admini } = await baza
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'moderator']);

  const ime = (nova.full_name ?? '').trim() || nova.username || 'Nova korisnica';
  const mesto = (nova.city ?? '').trim();

  let poslatoUkupno = 0;
  for (const a of admini ?? []) {
    poslatoUkupno += await posalji(a.id, {
      title: 'Nova korisnica',
      body: mesto ? `${ime} — ${mesto}` : ime,
      putanja: '/admin/korisnice',
      tag: `nova-korisnica-${userId}`,
    });
  }

  return odgovor({
    poslato: poslatoUkupno,
    administratora: (admini ?? []).length,
    verzija: VERZIJA,
    poslednja_greska: poslednjiOpis,
  });
});
