-- Drugi dnevni prolaz, zbog terapije.
--
-- Podsetnik za terapiju ide dva puta: ujutru „ne zaboravi", uveče opomena
-- samo onima koje tog dana nisu zabeležile sve doze. Postojeći posao radi u
-- 6:00 UTC, pa je ovo drugi unos u 18:00 UTC — 20h leti, 19h zimi.
--
-- Funkcija sama zaključuje koja je faza po satu (>= 14h UTC je veče), pa telo
-- zahteva ostaje prazno kao i kod jutarnjeg posla.
--
-- Razmak od 12 sati je veći od zaštite u funkciji (6 sati), pa se večernji
-- prolaz neće odbiti kao prečesto pokretanje.

select cron.schedule(
  'push-podsetnici-vece',
  '0 18 * * *',
  $$
  select net.http_post(
    url := 'https://wwippvsdyoexnheihzqg.supabase.co/functions/v1/posalji-podsetnike',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'service_role_kljuc'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Provera da su oba posla zavedena:
-- select jobname, schedule, active from cron.job where jobname like 'push-podsetnici%';

-- Da se večernji posao ukloni:
-- select cron.unschedule('push-podsetnici-vece');
