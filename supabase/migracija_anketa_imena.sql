-- Anketa za ime: porodica glasa za predložena imena.
--
-- Namerno bez prijave. Cilj je da se link pošalje baki i tetki, a one neće
-- otvarati nalog — zato ankete čita i u njima glasa svako ko ima adresu.
-- Adresa je nasumičan niz od deset znakova; ko je nema, ne može da je pogodi.

create table if not exists public.ankete_imena (
  id uuid primary key default gen_random_uuid(),
  kod text not null unique,
  naslov text,
  -- Vlasnik postoji samo ako je anketu napravila prijavljena korisnica; anketa
  -- radi i bez toga.
  user_id uuid references public.profiles (id) on delete set null,
  imena text[] not null,
  created_at timestamptz not null default now(),
  istice_u timestamptz not null default (now() + interval '90 days')
);

create index if not exists ankete_imena_kod_idx on public.ankete_imena (kod);

create table if not exists public.glasovi_imena (
  id uuid primary key default gen_random_uuid(),
  anketa_id uuid not null references public.ankete_imena (id) on delete cascade,
  ime text not null,
  -- Ko je glasao se ne čuva; pamti se samo nasumična oznaka iz pregledača,
  -- da isti uređaj ne glasa dvaput. Nikakav lični podatak ne ulazi ovde.
  glasac text not null,
  created_at timestamptz not null default now(),
  unique (anketa_id, glasac)
);

create index if not exists glasovi_imena_anketa_idx on public.glasovi_imena (anketa_id);

alter table public.ankete_imena enable row level security;
alter table public.glasovi_imena enable row level security;

-- Anketa se čita samo ako se zna njen kod — upit bez koda ne vraća ništa
-- korisno, jer se pretražuje po jedinstvenoj koloni.
drop policy if exists "ankete_citanje" on public.ankete_imena;
create policy "ankete_citanje" on public.ankete_imena for select using (true);

drop policy if exists "ankete_pravljenje" on public.ankete_imena;
create policy "ankete_pravljenje" on public.ankete_imena for insert with check (true);

-- Vlasnik sme da obriše svoju anketu; tuđe ne.
drop policy if exists "ankete_brisanje" on public.ankete_imena;
create policy "ankete_brisanje" on public.ankete_imena for delete
  using (user_id is not null and auth.uid() = user_id);

drop policy if exists "glasovi_citanje" on public.glasovi_imena;
create policy "glasovi_citanje" on public.glasovi_imena for select using (true);

drop policy if exists "glasovi_upis" on public.glasovi_imena;
create policy "glasovi_upis" on public.glasovi_imena for insert with check (true);

-- ---------------------------------------------------------------------------
-- Sopstvena imena u anketi
--
-- Spisak od 442 imena ne pokriva sve — neko će hteti ime koje nemamo, ili
-- oblik kakav se koristi u njihovoj porodici. Zato se dozvoljava slobodan
-- unos, ali kroz isti filter koji već čuva unos lekara i ustanova.
-- ---------------------------------------------------------------------------

create or replace function public.proveri_imena_ankete()
returns trigger
language plpgsql
as $$
declare
  ime text;
begin
  if array_length(new.imena, 1) is null or array_length(new.imena, 1) < 2 then
    raise exception 'Anketa mora da ima bar dva imena.';
  end if;

  if array_length(new.imena, 1) > 10 then
    raise exception 'Najviše deset imena po anketi.';
  end if;

  foreach ime in array new.imena loop
    if length(trim(ime)) < 2 or length(trim(ime)) > 30 then
      raise exception 'Ime mora imati između 2 i 30 znakova.';
    end if;
    -- Strogi režim: uz psovke hvata i „Koljač", „test", „asdf".
    if public.sadrzi_nedozvoljeno(ime, true) then
      raise exception 'Jedno od imena nije prihvatljivo.';
    end if;
  end loop;

  if new.naslov is not null and public.sadrzi_nedozvoljeno(new.naslov, false) then
    raise exception 'Naslov ankete nije prihvatljiv.';
  end if;

  return new;
end;
$$;

drop trigger if exists ankete_imena_filter on public.ankete_imena;
create trigger ankete_imena_filter
  before insert or update on public.ankete_imena
  for each row execute function public.proveri_imena_ankete();
