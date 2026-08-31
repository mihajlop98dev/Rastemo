-- Evidencija pokretanja posla za slanje podsetnika.
--
-- Zakazani posao ne šalje service_role ključ, pa se funkcija ne može zaštititi
-- proverom tajne — ona bi morala da stoji otvorena u podešavanjima posla.
-- Umesto toga funkcija gleda kad je poslednji put pokrenuta i odbija poziv ako
-- je to bilo skoro. Zloupotreba tako nema efekta, a `push_poslato` i dalje
-- sprečava da ista poruka ode dvaput.

create table if not exists public.push_pokretanja (
  id uuid primary key default gen_random_uuid(),
  pokrenuto_u timestamptz not null default now(),
  poslato_ukupno int not null default 0
);

create index if not exists push_pokretanja_vreme_idx
  on public.push_pokretanja (pokrenuto_u desc);

alter table public.push_pokretanja enable row level security;

-- Piše i čita samo posao na serveru (service_role zaobilazi RLS).
-- Korisnicama ovde nema šta da se vidi, pa nema nijedne politike.
