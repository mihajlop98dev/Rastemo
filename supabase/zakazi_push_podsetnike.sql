-- Zakazivanje dnevnog slanja podsetnika.
--
-- Ključ se ne upisuje u cron.schedule direktno: sve zakazane poslove vidi
-- svako ko ume da pročita cron.job, pa bi service_role ključ tamo stajao
-- otvoren. Umesto toga ide u Vault, a posao ga čita u trenutku izvršavanja.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Ključ se upisuje jednom. Zameni <SERVICE_ROLE_KEY> pravim ključem
-- (Project Settings → API → service_role), pokreni, pa obriši ovaj red iz
-- istorije SQL editora.
select vault.create_secret(
  '<SERVICE_ROLE_KEY>',
  'service_role_kljuc',
  'Za pozivanje Edge funkcija iz zakazanih poslova'
);

-- 6:00 UTC je 8 ujutru leti i 7 zimi — dovoljno rano da podsetnik za
-- sutrašnji pregled stigne na vreme, a ne usred noći.
select cron.schedule(
  'push-podsetnici',
  '0 6 * * *',
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

-- Provera da je posao zaveden:
-- select jobname, schedule, active from cron.job where jobname = 'push-podsetnici';

-- Da se posao ukloni:
-- select cron.unschedule('push-podsetnici');
