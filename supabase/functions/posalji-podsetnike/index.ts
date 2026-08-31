/**
 * Šalje push podsetnike.
 *
 * Pokreće se po rasporedu (pg_cron, jednom dnevno ujutru). Za svaku ženu
 * proverava šta joj je uključeno i da li podsetnik već poslat, pa šalje.
 *
 * Šifrovanje poruke radi `web-push` biblioteka — Web Push zahteva da telo
 * bude šifrovano ključevima uređaja, to se ne piše ručno.
 */
// Deno-nativna implementacija Web Push-a (RFC 8291/8292), na SubtleCrypto.
// `npm:web-push` je pisan za Node i u ovom okruženju je potpisivao ECDSA u DER
// obliku umesto sirovog R||S, pa je Apple svaki token odbijao sa BadJwtToken.
import * as webpush from 'jsr:@negrel/webpush@0.5.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const VAPID_JAVNI = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const VAPID_TAJNI = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
/**
 * `sub` polje VAPID tokena.
 *
 * Apple ovde ume da bude izbirljiv: `mailto:` adresu čiji domen ne ume da
 * proveri odbija sa `BadJwtToken`, isto kao da je potpis loš. Zato se
 * `mailto:` iz podešavanja prevodi u adresu sajta, koja uvek prolazi.
 */
const KONTAKT_IZ_SECRETS = Deno.env.get('VAPID_SUBJECT') ?? '';
const KONTAKT = KONTAKT_IZ_SECRETS.startsWith('https://')
  ? KONTAKT_IZ_SECRETS
  : 'https://dnevniktrudnoce.com';

/** Menja se uz svaku izmenu, da se vidi je li objavljena verzija stigla. */
const VERZIJA = 'v10-terapija';

/**
 * Ključevi se proveravaju ovde, a ne prepuštaju biblioteci.
 *
 * `setVapidDetails` na neispravan ključ baci grešku pri učitavanju modula, pa
 * ceo worker padne sa golim „WORKER_ERROR" i ne vidi se šta zapravo fali.
 * Najčešća greška je `=` na kraju: VAPID traži base64url bez dopune.
 */
function proveriKljuceve(): string | null {
  if (!VAPID_JAVNI || !VAPID_TAJNI) return 'VAPID ključevi nisu podešeni u Secrets.';
  if (VAPID_TAJNI.includes('=') || VAPID_JAVNI.includes('=')) {
    return 'Ključ sadrži „=". VAPID traži base64url bez dopune — skloni znakove = sa kraja.';
  }
  if (VAPID_TAJNI.length !== 43) {
    return `Tajni ključ ima ${VAPID_TAJNI.length} znakova, a treba tačno 43.`;
  }
  if (VAPID_JAVNI.length !== 87) {
    return `Javni ključ ima ${VAPID_JAVNI.length} znakova, a treba tačno 87.`;
  }
  return null;
}

/**
 * Da li tajni ključ zaista pripada javnom.
 *
 * Ovo se ne vidi ni iz jedne poruke o grešci: Apple i Google na nesaglasan par
 * vrate goli 403. Provera je jeftina — javni ključ nosi tačke x i y, tajni
 * nosi d; ako d ne odgovara toj tački, WebCrypto odbija da uveze ključ.
 */
async function parSePoklapa(): Promise<boolean | null> {
  const p = await potpisRadi();
  return typeof p === 'string' ? null : p.verifikuje;
}

/**
 * Potpiše probni tekst i odmah ga proveri javnim ključem — u istom okruženju
 * u kom se šalju notifikacije.
 *
 * Ovo je jedina karika koju sam do sada merio na svom računaru, a ne ovde.
 * Ako potpis nije 64 bajta ili se ne verifikuje, greška nije u Apple-u nego u
 * ovom runtime-u, i nema smisla dalje tražiti po tokenu.
 */
async function potpisRadi(): Promise<{ duzina: number; verifikuje: boolean } | string> {
  try {
    const javni = izB64url(VAPID_JAVNI);
    const x = b64url(javni.slice(1, 33));
    const y = b64url(javni.slice(33, 65));
    const alg = { name: 'ECDSA', namedCurve: 'P-256' } as const;

    const tajni = await crypto.subtle.importKey(
      'jwk', { kty: 'EC', crv: 'P-256', x, y, d: VAPID_TAJNI, ext: true }, alg, false, ['sign'],
    );
    const jav = await crypto.subtle.importKey(
      'jwk', { kty: 'EC', crv: 'P-256', x, y, ext: true }, alg, false, ['verify'],
    );

    const podatak = new TextEncoder().encode('proba');
    const potpis = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, tajni, podatak);
    const ok = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' }, jav, potpis, podatak,
    );
    return { duzina: potpis.byteLength, verifikuje: ok };
  } catch (e) {
    return `pukao: ${String(e).slice(0, 160)}`;
  }
}

/** Prevodi sirov VAPID par u JWK oblik, kakav biblioteka očekuje. */
async function ucitajKljuceve() {
  const javni = izB64url(VAPID_JAVNI);
  const x = b64url(javni.slice(1, 33));
  const y = b64url(javni.slice(33, 65));
  return await webpush.importVapidKeys(
    {
      publicKey: { kty: 'EC', crv: 'P-256', x, y, key_ops: ['verify'], ext: true },
      privateKey: { kty: 'EC', crv: 'P-256', x, y, d: VAPID_TAJNI, key_ops: ['sign'], ext: true },
    } as never,
    { extractable: false },
  );
}

const greskaKljuceva = proveriKljuceve();
let server: Awaited<ReturnType<typeof webpush.ApplicationServer.new>> | null = null;

async function dohvatiServer() {
  if (!server) {
    server = await webpush.ApplicationServer.new({
      contactInformation: KONTAKT,
      vapidKeys: await ucitajKljuceve(),
    });
  }
  return server;
}

// service_role zaobilazi RLS — funkcija mora da vidi tuđe pretplate.
const baza = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

interface Poruka {
  title: string;
  body: string;
  putanja?: string;
  tag?: string;
}

/** Šalje na sve uređaje jedne žene; mrtve pretplate briše. */

/* ---------- VAPID potpis ---------- */

const b64url = (b: Uint8Array) =>
  btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function izB64url(k: string): Uint8Array {
  const dop = '='.repeat((4 - (k.length % 4)) % 4);
  const s = atob((k + dop).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...s].map((z) => z.charCodeAt(0)));
}

let poslednjiOpis = '';

async function posalji(userId: string, poruka: Poruka): Promise<number> {
  const { data: pretplate } = await baza
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  let uspesno = 0;
  for (const p of pretplate ?? []) {
    try {
      const app = await dohvatiServer();
      const pretplatnik = app.subscribe({
        endpoint: p.endpoint,
        keys: { p256dh: p.p256dh, auth: p.auth },
      });
      await pretplatnik.pushTextMessage(JSON.stringify(poruka), { ttl: 86400 });
      uspesno++;
    } catch (e) {
      // Biblioteka baca PushMessageError sa celim odgovorom push servisa.
      const g = e as { response?: Response; message?: string };
      const kod = g.response?.status;
      const telo = g.response ? await g.response.text().catch(() => '') : '';
      // Apple uz 403 vraća i objašnjenje u telu; bez njega se ne razlikuje
      // loš token od isteklog ili od pogrešnog primaoca.
      poslednjiOpis = `${kod ?? '?'} ${(telo || g.message || '').slice(0, 300)}`;
      // 404/410 znače da uređaj više ne postoji ili je korisnica odjavila
      // notifikacije. Takvu pretplatu nema smisla čuvati.
      if (kod === 404 || kod === 410) {
        await baza.from('push_subscriptions').delete().eq('id', p.id);
      } else {
        await baza.from('push_subscriptions')
          .update({ poslednja_greska: poslednjiOpis })
          .eq('id', p.id);
      }
    }
  }
  return uspesno;
}

/** Da li je podsetnik već poslat ranije. */
async function vecPoslato(userId: string, vrsta: string, kljuc: string): Promise<boolean> {
  const { data } = await baza
    .from('push_poslato')
    .select('id')
    .eq('user_id', userId).eq('vrsta', vrsta).eq('kljuc', kljuc)
    .maybeSingle();
  return !!data;
}

/**
 * Upisuje da je podsetnik poslat — tek pošto je stvarno otišao na neki uređaj.
 *
 * Ranije se upisivalo pre slanja, pa je podsetnik ostajao zauvek označen kao
 * poslat i kad slanje nije uspelo (npr. žena još nije uključila notifikacije).
 * Time bi ga zauvek propustila.
 */
async function zabelezi(userId: string, vrsta: string, kljuc: string) {
  await baza.from('push_poslato').insert({ user_id: userId, vrsta, kljuc });
}

function danIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  // Zaštita od zloupotrebe nije lozinka nego učestalost.
  //
  // Zakazani posao ne šalje service_role ključ, pa provera po ključu ne dolazi
  // u obzir — tajna bi morala da stoji otvorena u podešavanjima posla. Umesto
  // toga: posao sme da se pokrene najviše jednom na svakih šest sati, a
  // `push_poslato` ionako sprečava da ista poruka ode dvaput. Ko bi funkciju
  // zvao u petlju, ne bi poslao nijednu notifikaciju viška.
  const RAZMAK_SATI = 6;
  const { data: poslednje } = await baza
    .from('push_pokretanja')
    .select('pokrenuto_u')
    .order('pokrenuto_u', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (poslednje) {
    const proteklo = (Date.now() - new Date(poslednje.pokrenuto_u).getTime()) / 3_600_000;
    if (proteklo < RAZMAK_SATI) {
      return new Response(
        JSON.stringify({ preskoceno: `Pokrenuto pre ${proteklo.toFixed(1)} h.` }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  if (greskaKljuceva) {
    return new Response(JSON.stringify({ greska: greskaKljuceva }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Izveštaj broji i korake, ne samo poslato: kad ništa ne stigne, mora da se
  // vidi gde se lanac prekinuo — nema pregleda, nema pretplate, ili je
  // podsetnik već bio poslat.
  const izvestaj = {
    pregledi: 0,
    nedelje: 0,
    terapija: 0,
    faza: '',
    bez_terapije: 0,
    terapija_vec_popijena: 0,
    nadjeno_pregleda_sutra: 0,
    preskoceno_iskljuceno: 0,
    preskoceno_vec_poslato: 0,
    bez_pretplate: 0,
    uredjaja_ukupno: 0,
    vapid_subject: KONTAKT,
    verzija: VERZIJA,
    // Provera para se radi samo kad slanje ne uspe: pogrešan ključ je najskuplja
    // greška za traženje, jer push servisi na njega vraćaju isti odgovor kao na
    // pokvaren token.
    tajni_odgovara_javnom: null as boolean | null,
    poslednja_greska_slanja: '',
  };

  const { count } = await baza
    .from('push_subscriptions')
    .select('id', { count: 'exact', head: true });
  izvestaj.uredjaja_ukupno = count ?? 0;

  // --- Pregled sutra ---
  const sutra = new Date();
  sutra.setDate(sutra.getDate() + 1);
  const sutraIso = danIso(sutra);

  const { data: pregledi } = await baza
    .from('appointments')
    .select('id, pregnancy_id, title, scheduled_at, pregnancies(user_id)')
    .gte('scheduled_at', `${sutraIso}T00:00:00Z`)
    .lte('scheduled_at', `${sutraIso}T23:59:59Z`);

  izvestaj.nadjeno_pregleda_sutra = (pregledi ?? []).length;

  for (const p of pregledi ?? []) {
    const userId = (p as any).pregnancies?.user_id;
    if (!userId) continue;

    const { data: profil } = await baza
      .from('profiles').select('push_pregledi').eq('id', userId).single();
    if (!profil?.push_pregledi) { izvestaj.preskoceno_iskljuceno++; continue; }

    const { count: imaUredjaj } = await baza
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (!imaUredjaj) { izvestaj.bez_pretplate++; continue; }

    if (await vecPoslato(userId, 'pregled', p.id)) {
      izvestaj.preskoceno_vec_poslato++;
      continue;
    }

    const vreme = new Date(p.scheduled_at).toLocaleTimeString('sr-Latn-RS', {
      hour: '2-digit', minute: '2-digit',
    });
    const poslato = await posalji(userId, {
      title: 'Sutra imaš pregled',
      body: `${p.title ?? 'Pregled'} u ${vreme}.`,
      putanja: `/appointment/${p.id}`,
      tag: `pregled-${p.id}`,
    });

    if (poslato > 0) {
      await zabelezi(userId, 'pregled', p.id);
      izvestaj.pregledi += poslato;
    }
  }

  // --- Nova nedelja trudnoće ---
  // Nedelja se menja na dan kad je gestacijska starost deljiva sa sedam, a to
  // pada tačno na isti dan u nedelji kao i početak trudnoće.
  const { data: trudnoce } = await baza
    .from('pregnancies')
    .select('id, user_id, due_date')
    .eq('is_active', true);

  const danas = new Date();
  for (const t of trudnoce ?? []) {
    const { data: profil } = await baza
      .from('profiles').select('push_nedelja').eq('id', t.user_id).single();
    if (!profil?.push_nedelja) continue;

    const termin = new Date(t.due_date);
    const preostalo = Math.round((termin.getTime() - danas.getTime()) / 86_400_000);
    const proteklo = 280 - preostalo;
    if (proteklo < 28 || proteklo > 294 || proteklo % 7 !== 0) continue;

    const nedelja = Math.floor(proteklo / 7);
    const kljuc = `${t.id}-${nedelja}`;
    if (await vecPoslato(t.user_id, 'nedelja', kljuc)) continue;

    const poslato = await posalji(t.user_id, {
      title: `Ušla si u ${nedelja}. nedelju`,
      body: 'Pogledaj šta se ove nedelje dešava sa bebom.',
      putanja: '/baby-development',
      tag: 'nedelja',
    });

    if (poslato > 0) {
      await zabelezi(t.user_id, 'nedelja', kljuc);
      izvestaj.nedelje += poslato;
    }
  }

  // --- Terapija i suplementi ---
  // Dva puta dnevno, po izboru: ujutru podsetnik da se popije, uveče opomena
  // samo onima koje tog dana nisu zabeležile sve doze. Uveče se ne šalje
  // slepo — žena koja je sve popila i zabeležila ne treba da dobije opomenu.
  //
  // Faza se čita iz sata umesto da stiže u telu zahteva: zakazani posao šalje
  // prazno telo, a dva unosa u cron-u su na 6h i 18h UTC.
  const veceMode = new Date().getUTCHours() >= 14;
  izvestaj.faza = veceMode ? 'vece' : 'jutro';

  const danasIso = danIso(new Date());

  const { data: lekovi } = await baza
    .from('medications')
    .select('id, name, dose_per_day, pregnancy_id, pregnancies(user_id, is_active)')
    .eq('active', true);

  // Više lekova pripada istoj ženi — grupišemo da ne bismo slali po jednu
  // notifikaciju za svaki lek.
  const poKorisnici = new Map<string, { id: string; dose_per_day: number }[]>();
  for (const l of lekovi ?? []) {
    const tr = (l as any).pregnancies;
    if (!tr?.user_id || !tr?.is_active) continue;
    const spisak = poKorisnici.get(tr.user_id) ?? [];
    spisak.push({ id: (l as any).id, dose_per_day: (l as any).dose_per_day ?? 1 });
    poKorisnici.set(tr.user_id, spisak);
  }

  for (const [userId, spisak] of poKorisnici) {
    const { data: profil } = await baza
      .from('profiles').select('push_terapija').eq('id', userId).single();
    if (!profil?.push_terapija) { izvestaj.preskoceno_iskljuceno++; continue; }

    const vrsta = veceMode ? 'terapija_vece' : 'terapija_jutro';
    const kljuc = danasIso;
    if (await vecPoslato(userId, vrsta, kljuc)) { izvestaj.preskoceno_vec_poslato++; continue; }

    let naslov = 'Terapija za danas';
    let telo = 'Ne zaboravi da popiješ terapiju i suplemente.';

    if (veceMode) {
      // Koliko je doza zabeleženo danas naspram koliko ih je trebalo.
      const trebalo = spisak.reduce((z, l) => z + l.dose_per_day, 0);
      const { count: popijeno } = await baza
        .from('medication_logs')
        .select('id', { count: 'exact', head: true })
        .in('medication_id', spisak.map((l) => l.id))
        .gte('taken_at', `${danasIso}T00:00:00Z`)
        .lte('taken_at', `${danasIso}T23:59:59Z`);

      if ((popijeno ?? 0) >= trebalo) { izvestaj.terapija_vec_popijena++; continue; }

      const fali = trebalo - (popijeno ?? 0);
      naslov = 'Nisi zabeležila celu terapiju';
      telo = fali === 1
        ? 'Ostala je još jedna doza za danas.'
        : `Ostalo je još ${fali} doze za danas.`;
    }

    const poslato = await posalji(userId, {
      title: naslov,
      body: telo,
      putanja: '/tracking?tab=terapija',
      tag: vrsta,
    });

    if (poslato > 0) {
      await zabelezi(userId, vrsta, kljuc);
      izvestaj.terapija += poslato;
    } else {
      izvestaj.bez_terapije++;
    }
  }

  izvestaj.poslednja_greska_slanja = poslednjiOpis;
  if (poslednjiOpis) izvestaj.tajni_odgovara_javnom = await parSePoklapa();

  await baza.from('push_pokretanja').insert({
    poslato_ukupno: izvestaj.pregledi + izvestaj.nedelje + izvestaj.terapija,
  });

  return new Response(JSON.stringify(izvestaj), {
    headers: { 'Content-Type': 'application/json' },
  });
});
