/**
 * Nedeljni mejl: „Počela je 15. nedelja — evo šta je novo".
 *
 * Zašto: od 32 korisnice samo jedna je uključila push notifikacije, pa
 * aplikacija praktično nikome nije mogla da se javi. Mejl stiže svima koje su
 * potvrdile adresu, bez instaliranja i dozvola.
 *
 * Pokreće se jednom dnevno (pg_cron, vidi zakazi_nedeljni_mejl.sql). Šalje
 * samo onima kojima baš danas počinje nova nedelja, i samo jednom po nedelji
 * (beleži se u push_poslato sa vrstom 'mejl_nedelja').
 *
 * Načini poziva:
 *   POST {}  — nedeljno slanje; sme samo sa service_role ključem (zakazani posao).
 *   POST {"proba":"adresa"} — jedan probni nedeljni mejl, ništa se ne beleži.
 *   POST {"vrsta":"povratak", ...} — jednokratni mejl za povratak (vidi dole).
 *   GET ?odjava=<id>.<potpis> — odjava jednim klikom iz mejla, bez prijave.
 *
 * Potrebni Secrets:
 *   RESEND_API_KEY  — ključ sa resend.com (domen dnevniktrudnoce.com mora biti potvrđen)
 *   MEJL_POSILJALAC — npr. "Dnevnik trudnoće <nedelja@dnevniktrudnoce.com>"
 *   MEJL_TAJNA      — bilo koji dugačak nasumičan tekst; potpisuje linkove za odjavu
 * SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY Supabase daje sam.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { VODIC } from '../../../src/app/core/data/vodic-nedelje.ts';
import { babyComparisonForWeek } from '../../../src/app/core/data/baby-growth.ts';

const URL_BAZE = Deno.env.get('SUPABASE_URL') ?? '';
const SERVISNI = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const RESEND = Deno.env.get('RESEND_API_KEY') ?? '';
const POSILJALAC = Deno.env.get('MEJL_POSILJALAC') ?? 'Dnevnik trudnoće <nedelja@dnevniktrudnoce.com>';
const TAJNA = Deno.env.get('MEJL_TAJNA') ?? '';
const SAJT = 'https://dnevniktrudnoce.com';

/** Prvi mejl tek od 5. nedelje — ranije je trudnoća često još nepotvrđena. */
const OD_NEDELJE = 5;
const DO_NEDELJE = 41;

/** Svi tajni ključevi projekta koje Supabase daje funkciji. */
function tajniKljucevi(): string[] {
  const kljucevi = SERVISNI ? [SERVISNI] : [];
  try {
    const novi = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    for (const v of Object.values(novi)) if (typeof v === 'string') kljucevi.push(v);
  } catch { /* nema novih ključeva */ }
  return kljucevi;
}

const baza = createClient(URL_BAZE, SERVISNI, { auth: { persistSession: false } });

// --- potpis linka za odjavu ---

async function potpis(tekst: string): Promise<string> {
  const kljuc = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(TAJNA), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', kljuc, new TextEncoder().encode(tekst)));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 32);
}

async function linkZaOdjavu(userId: string): Promise<string> {
  const funkcija = `${URL_BAZE}/functions/v1/posalji-nedeljni-mejl`;
  return `${funkcija}?odjava=${userId}.${await potpis(userId)}`;
}

function stranica(naslov: string, tekst: string): Response {
  const html = `<!doctype html><html lang="sr"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${naslov}</title>
<body style="font-family:-apple-system,Segoe UI,sans-serif;background:#FBF4EC;color:#372E2A;padding:40px 20px;text-align:center">
<h1 style="font-size:22px">${naslov}</h1><p style="font-size:16px;line-height:1.5">${tekst}</p>
<p><a href="${SAJT}/home" style="color:#CE4F68;font-weight:600">Otvori Dnevnik trudnoće</a></p></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function odjavi(param: string): Promise<Response> {
  const [userId, sig] = param.split('.');
  if (!userId || !sig || !TAJNA || sig !== await potpis(userId)) {
    return stranica('Link nije ispravan', 'Mejlove možeš da isključiš i u aplikaciji: Profil → Notifikacije.');
  }
  await baza.from('profiles').update({ mejl_nedeljno: false }).eq('id', userId);
  return stranica('Odjavljena si', 'Više ti nećemo slati nedeljni mejl. Ako se predomisliš, uključi ga u Profil → Notifikacije.');
}

// --- sadržaj mejla ---

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function mejl(ime: string, nedelja: number, odjava: string): { subject: string; html: string; text: string } {
  const v = VODIC.find((x) => x.nedelja === nedelja);
  const velicina = babyComparisonForWeek(nedelja);
  const subject = `Počela je ${nedelja}. nedelja — beba je veličine ${velicina}`;

  const odeljak = (ikona: string, naslov: string, tekst: string) => `
    <tr><td style="padding:14px 0;border-top:1px solid #F3E9DC">
      <div style="font-size:15px;font-weight:700;margin-bottom:4px">${ikona} ${naslov}</div>
      <div style="font-size:15px;line-height:1.55;color:#6F6259">${escape(tekst)}</div>
    </td></tr>`;

  const html = `<!doctype html><html lang="sr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FBF4EC;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#372E2A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:22px;padding:28px 24px">
  <tr><td style="text-align:center">
    <div style="font-size:15px;color:#6F6259">Ćao ${escape(ime)} 👋</div>
    <div style="font-size:34px;font-weight:700;color:#CE4F68;margin:6px 0 4px">${nedelja}. nedelja</div>
    <div style="font-size:16px">Beba je sada veličine <strong style="color:#CE4F68">${velicina}</strong></div>
  </td></tr>
  ${v ? `<tr><td style="padding:18px 0 4px;font-size:16px;font-weight:600;line-height:1.45">${escape(v.uvod)}</td></tr>
  ${odeljak('👶', 'Beba', v.beba)}
  ${odeljak('💗', 'Ti', v.ti)}
  ${odeljak('💡', 'Savet nedelje', v.savet)}` : ''}
  <tr><td style="padding:22px 0 6px;text-align:center">
    <a href="${SAJT}/home" style="display:inline-block;background:#E5677E;color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:999px">Zabeleži kako se osećaš</a>
  </td></tr>
  <tr><td style="padding-top:18px;font-size:12px;line-height:1.5;color:#A79A8E;text-align:center">
    Sadržaj je informativan i ne zamenjuje savet lekara. U hitnim slučajevima pozovi 194.<br>
    Ovaj mejl stiže jednom nedeljno. <a href="${odjava}" style="color:#A79A8E">Ne želim više ove mejlove</a>
  </td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    `Ćao ${ime},`, '', `Počela je ${nedelja}. nedelja. Beba je sada veličine ${velicina}.`, '',
    ...(v ? [v.uvod, '', `Beba: ${v.beba}`, '', `Ti: ${v.ti}`, '', `Savet nedelje: ${v.savet}`, ''] : []),
    `Otvori Dnevnik: ${SAJT}/home`, '', `Odjava od ovih mejlova: ${odjava}`,
  ].join('\n');

  return { subject, html, text };
}

async function posaljiMejl(to: string, sadrzaj: { subject: string; html: string; text: string }, odjava: string) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: POSILJALAC,
      to: [to],
      subject: sadrzaj.subject,
      html: sadrzaj.html,
      text: sadrzaj.text,
      headers: { 'List-Unsubscribe': `<${odjava}>` },
    }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

// --- slanje ---

/** Dan trudnoće danas za dati termin — isto kao u aplikaciji. */
function danaTrudnoce(terminIso: string): number {
  const [g, m, d] = terminIso.split('-').map(Number);
  const termin = Date.UTC(g, m - 1, d);
  const sad = new Date();
  const danas = Date.UTC(sad.getUTCFullYear(), sad.getUTCMonth(), sad.getUTCDate());
  return 280 - Math.round((termin - danas) / 86_400_000);
}

async function posaljiSvima(probaNa?: string) {
  const izvestaj = { poslato: 0, preskoceno: 0, greske: [] as string[] };

  const { data: trudnoce, error } = await baza
    .from('pregnancies')
    .select('id, user_id, due_date, profiles(full_name, mejl_nedeljno)')
    .eq('is_active', true);
  if (error) throw error;

  for (const t of trudnoce ?? []) {
    const profil = (t as any).profiles;
    if (!profil?.mejl_nedeljno) { izvestaj.preskoceno++; continue; }

    const dana = danaTrudnoce(t.due_date);
    const nedelja = Math.floor(dana / 7);
    const pocetakNedelje = dana % 7 === 0;
    if (!probaNa && (!pocetakNedelje || nedelja < OD_NEDELJE || nedelja > DO_NEDELJE)) continue;

    const kljuc = `${t.id}-${nedelja}`;
    if (!probaNa) {
      const { count } = await baza.from('push_poslato').select('id', { count: 'exact', head: true })
        .eq('user_id', t.user_id).eq('vrsta', 'mejl_nedelja').eq('kljuc', kljuc);
      if (count) { izvestaj.preskoceno++; continue; }
    }

    const { data: korisnik } = await baza.auth.admin.getUserById(t.user_id);
    const adresa = korisnik?.user?.email;
    if (!adresa || !korisnik?.user?.email_confirmed_at) { izvestaj.preskoceno++; continue; }
    if (probaNa && adresa !== probaNa) continue;

    try {
      const odjava = await linkZaOdjavu(t.user_id);
      const ime = (profil.full_name ?? '').split(' ')[0] || 'mama';
      await posaljiMejl(adresa, mejl(ime, Math.max(nedelja, OD_NEDELJE), odjava), odjava);
      if (!probaNa) {
        await baza.from('push_poslato').insert({ user_id: t.user_id, vrsta: 'mejl_nedelja', kljuc });
      }
      izvestaj.poslato++;
    } catch (e) {
      izvestaj.greske.push(String((e as Error).message ?? e));
    }
  }
  return izvestaj;
}

// --- jednokratni mejl za povratak (nov. 2026) ---
//
// 26 od 32 korisnice su otvorile aplikaciju samo jednom. Posle osveženja
// aplikacije šalje im se jedan lični mejl: gde su sada u trudnoći i šta je
// novo. Kome trudnoća nije podešena, poziv da završi (treba jedan datum).
// Šalje se ručno, jednom; beleži se kao 'mejl_povratak' da se ne ponovi.

const KLJUC_POVRATKA = '2026-11';

function mejlPovratak(ime: string, nedelja: number | null, odjava: string) {
  const imaTrudnocu = nedelja !== null && nedelja >= 4 && nedelja <= 42;
  const velicina = imaTrudnocu ? babyComparisonForWeek(nedelja!) : '';
  const subject = imaTrudnocu
    ? `${ime}, sada si u ${nedelja}. nedelji — pogledaj šta je novo kod bebe`
    : `${ime}, tvoj dnevnik trudnoće te čeka`;

  const glavno = imaTrudnocu
    ? `<div style="font-size:15px;color:#6F6259">Ćao ${escape(ime)} 👋</div>
       <div style="font-size:16px;margin-top:10px">Dok te nije bilo, tvoja beba je rasla. Sada si u</div>
       <div style="font-size:34px;font-weight:700;color:#CE4F68;margin:4px 0">${nedelja}. nedelji</div>
       <div style="font-size:16px">a beba je veličine <strong style="color:#CE4F68">${velicina}</strong>.</div>`
    : `<div style="font-size:15px;color:#6F6259">Ćao ${escape(ime)} 👋</div>
       <div style="font-size:22px;font-weight:700;margin:10px 0 6px">Tvoj dnevnik je spreman</div>
       <div style="font-size:16px;line-height:1.5">Otvorila si nalog, ali dnevnik još ne zna u kojoj si nedelji.
       Treba samo jedan datum — termin porođaja ili poslednja menstruacija — i sve ostalo se računa samo.</div>`;

  const novo = [
    ['📅', 'Svaki dan nešto novo', 'Zanimljivost o bebi ili mala ideja za taj dan trudnoće.'],
    ['👶', 'Tvoja nedelja, ne trimestar', 'Šta se baš ove nedelje dešava sa bebom i sa tobom.'],
    ['🗓️', 'Ništa ti ne promakne', 'Upiši preglede i analize, a mi te podsetimo dan ranije.'],
  ].map(([i, n, t]) => `<tr><td style="padding:10px 0;border-top:1px solid #F3E9DC">
      <div style="font-size:15px;font-weight:700">${i} ${n}</div>
      <div style="font-size:15px;line-height:1.5;color:#6F6259">${t}</div></td></tr>`).join('');

  const dugme = imaTrudnocu ? 'Pogledaj svoju nedelju' : 'Upiši datum (10 sekundi)';

  const html = `<!doctype html><html lang="sr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FBF4EC;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#372E2A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:22px;padding:28px 24px">
  <tr><td style="text-align:center">${glavno}</td></tr>
  <tr><td style="padding:22px 0 8px;font-size:16px;font-weight:700">Osvežili smo Dnevnik trudnoće:</td></tr>
  ${novo}
  <tr><td style="padding:22px 0 6px;text-align:center">
    <a href="${SAJT}/home" style="display:inline-block;background:#E5677E;color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:999px">${dugme}</a>
  </td></tr>
  <tr><td style="padding-top:6px;font-size:14px;color:#6F6259;text-align:center">Ako ti nešto nije jasno ili fali, samo odgovori na ovaj mejl — čitamo svaki.</td></tr>
  <tr><td style="padding-top:18px;font-size:12px;line-height:1.5;color:#A79A8E;text-align:center">
    Dobijaš ovaj mejl jer imaš nalog na dnevniktrudnoce.com.
    <a href="${odjava}" style="color:#A79A8E">Ne želim mejlove</a>
  </td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    `Ćao ${ime},`, '',
    imaTrudnocu ? `Sada si u ${nedelja}. nedelji, a beba je veličine ${velicina}.` : 'Tvoj dnevnik je spreman — treba samo jedan datum (termin ili poslednja menstruacija).',
    '', 'Osvežili smo Dnevnik trudnoće: svaki dan nešto novo, tekst za tvoju nedelju i podsetnik pred svaki pregled.', '',
    `${dugme}: ${SAJT}/home`, '', 'Ako ti nešto fali, odgovori na ovaj mejl.', '', `Odjava: ${odjava}`,
  ].join('\n');

  return { subject, html, text };
}

async function posaljiPovratak(probaNa?: string) {
  const izvestaj = { poslato: 0, preskoceno: 0, greske: [] as string[] };
  const { data: spisak, error } = await baza.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;

  for (const u of spisak.users) {
    if (!u.email || !u.email_confirmed_at) { izvestaj.preskoceno++; continue; }
    if (probaNa && u.email !== probaNa) continue;

    const { data: profil } = await baza.from('profiles')
      .select('full_name, role, mejl_nedeljno').eq('id', u.id).maybeSingle();
    if (!profil || ['admin', 'moderator'].includes(profil.role) && !probaNa) { izvestaj.preskoceno++; continue; }
    if (!probaNa && profil.mejl_nedeljno === false) { izvestaj.preskoceno++; continue; }

    if (!probaNa) {
      const { count } = await baza.from('push_poslato').select('id', { count: 'exact', head: true })
        .eq('user_id', u.id).eq('vrsta', 'mejl_povratak').eq('kljuc', KLJUC_POVRATKA);
      if (count) { izvestaj.preskoceno++; continue; }
    }

    const { data: t } = await baza.from('pregnancies').select('due_date')
      .eq('user_id', u.id).eq('is_active', true).maybeSingle();
    const nedelja = t ? Math.floor(danaTrudnoce(t.due_date) / 7) : null;

    try {
      const odjava = await linkZaOdjavu(u.id);
      const ime = (profil.full_name ?? '').split(' ')[0] || 'mama';
      await posaljiMejl(u.email, mejlPovratak(ime, nedelja, odjava), odjava);
      if (!probaNa) await baza.from('push_poslato').insert({ user_id: u.id, vrsta: 'mejl_povratak', kljuc: KLJUC_POVRATKA });
      izvestaj.poslato++;
    } catch (e) {
      izvestaj.greske.push(String((e as Error).message ?? e));
    }
  }
  return izvestaj;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const odjava = url.searchParams.get('odjava');
    return odjava ? odjavi(odjava) : stranica('Dnevnik trudnoće', '');
  }

  // Slanje sme samo zakazani posao, sa tajnim ključem projekta — starim
  // service_role JWT-om ili novim sb_secret_ ključem. Javni (publishable)
  // ključ ovde namerno ne prolazi: njega ima svako ko otvori sajt.
  const auth = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!auth || !tajniKljucevi().includes(auth)) {
    return new Response('Zabranjeno', { status: 403 });
  }
  if (!RESEND || !TAJNA) {
    return Response.json({ greska: 'Nedostaju Secrets: RESEND_API_KEY i/ili MEJL_TAJNA.' }, { status: 500 });
  }

  // { "proba": "adresa@primer.com" } — šalje jedan probni mejl toj adresi,
  // bez obzira na dan, i ništa ne beleži. Za proveru izgleda pre puštanja.
  const telo = await req.json().catch(() => ({}));
  const proba = typeof telo?.proba === 'string' ? telo.proba : undefined;

  // { "vrsta": "povratak", "proba": "adresa" } — probni mejl za povratak.
  // { "vrsta": "povratak", "potvrda": "POSALJI_SVIMA" } — jednokratno svima.
  if (telo?.vrsta === 'povratak') {
    if (!proba && telo?.potvrda !== 'POSALJI_SVIMA') {
      return Response.json({ greska: 'Za slanje svima dodaj "potvrda": "POSALJI_SVIMA", ili "proba" za jednu adresu.' }, { status: 400 });
    }
    return Response.json(await posaljiPovratak(proba));
  }

  return Response.json(await posaljiSvima(proba));
});
