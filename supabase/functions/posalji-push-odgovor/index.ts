/**
 * Push kad neko odgovori na temu.
 *
 * Zašto zasebna funkcija, a ne zakazani posao: odgovor na forumu ima smisla
 * samo dok je razgovor živ. Zakazani posao radi dvaput dnevno, pa bi push
 * stizao i po deset sati kasnije — do tada je žena već sama videla odgovor.
 *
 * Aplikacija je zove odmah pošto upiše odgovor, sa tokenom prijavljene
 * korisnice. Ko je autor teme funkcija utvrđuje sama, preko service_role
 * ključa iz svog okruženja — aplikacija to ne sme da zna jer tema može biti
 * anonimna.
 */
import { baza, posalji, proveriKljuceve, poslednjiOpis } from '../_shared/push.ts';

const VERZIJA = 'v4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const odgovor = (telo: unknown, status = 200) =>
  new Response(JSON.stringify(telo), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const greskaKljuceva = proveriKljuceve();
  if (greskaKljuceva) return odgovor({ greska: greskaKljuceva, verzija: VERZIJA }, 500);

  // Ko zove: token prijavljene korisnice, ne service_role. Bez ovoga bi bilo
  // ko mogao da natera funkciju da šalje push proizvoljnoj ženi.
  const zaglavlje = req.headers.get('Authorization') ?? '';
  const token = zaglavlje.replace('Bearer ', '');
  if (!token) return odgovor({ greska: 'Potrebna je prijava.' }, 401);

  // Ko zove: token prijavljene korisnice.
  //
  // Potpis i rok ne proveravamo ovde — funkcija je postavljena sa
  // `verify_jwt`, pa Supabase odbija neispravan ili istekao token pre nego
  // sto nas kod uopste krene. Ostaje da procitamo ko je i da odbijemo token
  // koji nije korisnicki (npr. service_role), jer takav nema `sub`.
  //
  // `auth.getUser(token)` se ne koristi: u ovoj verziji biblioteke ignorise
  // prosledjen token i trazi sacuvanu sesiju, pa u funkciji uvek vraca
  // „Auth session missing".
  let korisnikId = '';
  try {
    const telo = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    );
    if (telo.role === 'authenticated') korisnikId = telo.sub ?? '';
  } catch {
    // ostaje prazno
  }
  if (!korisnikId) return odgovor({ greska: 'Prijava nije važeća.', verzija: VERZIJA }, 401);

  let topicId = '';
  try {
    topicId = (await req.json())?.topic_id ?? '';
  } catch {
    return odgovor({ greska: 'Telo zahteva nije ispravno.' }, 400);
  }
  if (!topicId) return odgovor({ greska: 'Nedostaje topic_id.' }, 400);

  const { data: tema } = await baza
    .from('forum_topics')
    .select('id, title, author_id')
    .eq('id', topicId)
    .maybeSingle();

  if (!tema) return odgovor({ greska: 'Tema ne postoji.' }, 404);

  // Odgovor na sopstvenu temu ne šalje ništa.
  if (tema.author_id === korisnikId) return odgovor({ preskoceno: 'Autorka je sama odgovorila.' });

  const { data: profil } = await baza
    .from('profiles').select('push_zajednica').eq('id', tema.author_id).single();
  if (!profil?.push_zajednica) return odgovor({ preskoceno: 'Podsetnik je isključen.' });

  const poslato = await posalji(tema.author_id, {
    title: 'Novi odgovor na tvoju temu',
    body: tema.title,
    putanja: `/zajednica/tema/${tema.id}`,
    tag: `forum-${tema.id}`,
  });

  return odgovor({ poslato, verzija: VERZIJA, poslednja_greska: poslednjiOpis });
});
