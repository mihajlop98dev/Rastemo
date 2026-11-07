-- ---------------------------------------------------------------------------
-- Nedeljni mejl „Počela je N. nedelja"
--
-- Push je do sada uključila 1 od 32 korisnice, pa aplikacija praktično nikome
-- nije mogla da se javi. Mejl stiže svakoj koja je potvrdila adresu.
--
-- Podrazumevano uključeno: sadržaj je deo usluge (šta se dešava u njenoj
-- nedelji trudnoće), svaki mejl ima odjavu jednim klikom, a isključuje se i u
-- Profil → Notifikacije. Proveriti da Politika privatnosti to pominje.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists mejl_nedeljno boolean not null default true;

-- Korisnica sme sama da menja ovo podešavanje (kolone se dozvoljavaju
-- pojedinačno — vidi popravka_uslovi_dozvole.sql).
grant update (mejl_nedeljno) on public.profiles to authenticated;
