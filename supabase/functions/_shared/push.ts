/**
 * Slanje push poruka — zajedničko za sve funkcije koje šalju notifikacije.
 *
 * Izdvojeno iz `posalji-podsetnike` kad je stigla druga funkcija koja isto
 * šalje push. VAPID deo je bio najskuplji za nameštanje, pa stoji na jednom
 * mestu: pogrešan ključ push servisi prijavljuju istom greškom kao pokvaren
 * token, i traženje uzroka onda traje danima.
 */
import * as webpush from 'jsr:@negrel/webpush@0.5.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const VAPID_JAVNI = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const VAPID_TAJNI = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

const KONTAKT_IZ_SECRETS = Deno.env.get('VAPID_SUBJECT') ?? '';
const KONTAKT = KONTAKT_IZ_SECRETS.startsWith('https://')
  ? KONTAKT_IZ_SECRETS
  : (KONTAKT_IZ_SECRETS || 'mailto:podrska@dnevniktrudnoce.com');

/** service_role zaobilazi RLS — funkcija mora da vidi tuđe pretplate. */
export const baza = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

export function proveriKljuceve(): string {
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
  return '';
}

const b64url = (b: Uint8Array) =>
  btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function izB64url(k: string): Uint8Array {
  const dop = '='.repeat((4 - (k.length % 4)) % 4);
  const s = atob((k + dop).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...s].map((z) => z.charCodeAt(0)));
}

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

export interface Poruka {
  title: string;
  body: string;
  putanja?: string;
  tag?: string;
}

export let poslednjiOpis = '';

/** Šalje na sve uređaje jedne žene; mrtve pretplate briše. Vraća broj uspelih. */
export async function posalji(userId: string, poruka: Poruka): Promise<number> {
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
      const g = e as { response?: Response; message?: string };
      const kod = g.response?.status;
      const telo = g.response ? await g.response.text().catch(() => '') : '';
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
