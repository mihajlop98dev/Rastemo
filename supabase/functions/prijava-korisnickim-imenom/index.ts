/**
 * Prijava korisničkim imenom.
 *
 * Supabase prijavljuje po mejlu, pa je negde potrebno prevesti korisničko ime
 * u mejl. To se namerno ne radi javnom funkcijom koja bi vratila mejl:
 * korisnička imena stoje na javnom forumu, pa bi svako mogao da ih pokupi i
 * preko njih dođe do adresa svih korisnica.
 *
 * Zato prevod i prijava rade ovde, a napolje izlazi samo sesija — mejl ne
 * napušta server ni u jednom odgovoru.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const URL_PROJEKTA = Deno.env.get('SUPABASE_URL')!;
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Content-Type': 'application/json',
};

function odgovor(telo: unknown, status = 200) {
  return new Response(JSON.stringify(telo), { status, headers: CORS });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  let korisnicko = '';
  let lozinka = '';
  try {
    const telo = await req.json();
    korisnicko = String(telo.korisnicko_ime ?? '').trim();
    lozinka = String(telo.lozinka ?? '');
  } catch {
    return odgovor({ greska: 'Neispravan zahtev.' }, 400);
  }

  if (!korisnicko || !lozinka) {
    return odgovor({ greska: 'Unesi korisničko ime i lozinku.' }, 400);
  }

  const admin = createClient(URL_PROJEKTA, SERVICE);

  const { data: profil } = await admin
    .from('profiles')
    .select('id')
    .ilike('username', korisnicko)
    .maybeSingle();

  // Ista poruka i kad ime ne postoji i kad je lozinka pogrešna: razlika bi
  // otkrila koja su korisnička imena zauzeta na nalozima.
  const NEUSPELO = { greska: 'Korisničko ime ili lozinka nisu tačni.' };
  if (!profil) return odgovor(NEUSPELO, 400);

  const { data: nalog } = await admin.auth.admin.getUserById(profil.id);
  const mejl = nalog?.user?.email;
  if (!mejl) return odgovor(NEUSPELO, 400);

  const klijent = createClient(URL_PROJEKTA, ANON);
  const { data, error } = await klijent.auth.signInWithPassword({
    email: mejl,
    password: lozinka,
  });

  if (error || !data.session) return odgovor(NEUSPELO, 400);

  // Napolje ide samo sesija; mejl se ne vraća.
  return odgovor({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});
