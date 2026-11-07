-- Zakazivanje nedeljnog mejla (jednom dnevno; funkcija sama bira kome je
-- danas počela nova nedelja).
--
-- Pre ovoga:
--   1. migracija_nedeljni_mejl.sql
--   2. Napravi nalog na resend.com, potvrdi domen dnevniktrudnoce.com (DNS zapisi)
--   3. Supabase → Edge Functions → Secrets:
--        RESEND_API_KEY   = ključ sa Resend-a
--        MEJL_POSILJALAC  = Dnevnik trudnoće <nedelja@dnevniktrudnoce.com>
--        MEJL_TAJNA       = dugačak nasumičan tekst (npr. iz: openssl rand -hex 32)
--   4. npx supabase functions deploy posalji-nedeljni-mejl
--   5. Probni mejl samo sebi (ništa se ne beleži):
--        curl -X POST https://wwippvsdyoexnheihzqg.supabase.co/functions/v1/posalji-nedeljni-mejl \
--          -H "Authorization: Bearer <SERVICE_ROLE_KEY>" -H "Content-Type: application/json" \
--          -d '{"proba":"tvoja@adresa.com"}'
--
-- Ključ service_role je već u Vault-u (zakazi_push_podsetnike.sql).

-- 7:00 UTC = 8 ujutru zimi, 9 leti — mejl je prvi u sandučetu tog jutra.
select cron.schedule(
  'nedeljni-mejl',
  '0 7 * * *',
  $$
  select net.http_post(
    url := 'https://wwippvsdyoexnheihzqg.supabase.co/functions/v1/posalji-nedeljni-mejl',
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

-- Provera:  select jobname, schedule, active from cron.job where jobname = 'nedeljni-mejl';
-- Uklanjanje: select cron.unschedule('nedeljni-mejl');
