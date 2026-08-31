-- Push notifikacije: pretplate uređaja i podešavanja korisnice.
--
-- Jedna žena može imati više uređaja (telefon, tablet), pa se pretplate čuvaju
-- po uređaju a ne po nalogu. Endpoint je jedinstven po uređaju i po sajtu, i
-- služi kao ključ — kad pregledač obnovi pretplatu, stara se zameni umesto da
-- se napravi duplikat.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  -- Čemu služi: uređaj koji vrati 404/410 pri slanju je odjavljen i briše se.
  poslednja_greska text,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Pretplata je lični podatak: sadrži adresu na koju stižu poruke tom uređaju.
drop policy if exists "push_owner_all" on public.push_subscriptions;
create policy "push_owner_all" on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Šta sme da stigne na telefon. Podsetnik na pregled je uključen jer je to
-- jedini razlog zbog kog većina i pristane; ostalo neka bira sama.
alter table public.profiles
  add column if not exists push_pregledi boolean not null default true,
  add column if not exists push_nedelja boolean not null default true,
  add column if not exists push_terapija boolean not null default false,
  add column if not exists push_zajednica boolean not null default false;

-- Da se isti podsetnik ne pošalje dvaput ako se posao pokrene ponovo.
create table if not exists public.push_poslato (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  vrsta text not null,
  kljuc text not null,
  poslato_u timestamptz not null default now(),
  unique (user_id, vrsta, kljuc)
);

alter table public.push_poslato enable row level security;

-- Ovu tabelu piše samo posao na serveru (service_role zaobilazi RLS);
-- korisnica sme da vidi svoje redove, ali nema šta da menja.
drop policy if exists "push_poslato_read" on public.push_poslato;
create policy "push_poslato_read" on public.push_poslato for select
  using (auth.uid() = user_id);
