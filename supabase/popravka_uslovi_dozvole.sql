-- Ispravka: oduzimanje kolona nije proradilo iz prvog puta.
--
-- Prethodna skripta je imala samo:
--
--   revoke update (terms_accepted_at, terms_version) on public.profiles ...
--
-- To ne radi. U PostgreSQL-u, ako rola već ima UPDATE nad celom tabelom,
-- oduzimanje pojedinačne kolone nema efekta — dozvola na nivou tabele i dalje
-- pokriva sve kolone. Provereno uživo: falsifikovanje datuma je i posle te
-- skripte prolazilo sa statusom 204.
--
-- Ispravan redosled je isti onaj koji je već korišćen za forum: prvo oduzeti
-- dozvolu nad tabelom, pa vratiti pojedinačne kolone.
--
-- Spisak kolona ispod je tačno ono što aplikacija upisuje. Sve ostalo —
-- `role`, `terms_accepted_at`, `terms_version`, `created_at`, `id` — više se
-- ne može dirati preko API-ja ni pod kojim uslovima.

revoke update on public.profiles from anon, authenticated;

grant update (
  full_name,
  city,
  avatar_url,
  birth_date,
  height_cm,
  weight_kg,
  username,
  default_anonymous,
  push_pregledi,
  push_nedelja,
  push_terapija,
  push_zajednica
) on public.profiles to authenticated;

-- `prihvati_uslove` je SECURITY DEFINER, pa i dalje sme da upiše datum —
-- funkcija radi sa pravima vlasnika, ne pozivaoca. To je i bila poenta.

-- Provera 1 — falsifikovanje datuma (treba da baci gresku o dozvolama):
-- update public.profiles set terms_accepted_at = '2020-01-01' where id = auth.uid();
--
-- Provera 2 — obicna izmena profila (treba da prodje):
-- update public.profiles set city = 'Beograd' where id = auth.uid();
--
-- Provera 3 — koje kolone rola sme da menja:
-- select column_name from information_schema.column_privileges
-- where table_name = 'profiles' and grantee = 'authenticated' and privilege_type = 'UPDATE'
-- order by column_name;
