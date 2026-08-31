-- Korisničko ime uneto pri registraciji nije stizalo do profila.
--
-- Šta se desilo: `migracija_korisnicko_ime.sql` je proširila `handle_new_user`
-- da prepiše korisničko ime iz metapodataka. Ali `migracija_potvrda_mejla.sql`
-- istu funkciju definiše iznova, sa `create or replace`, i u svom upisu nema
-- kolonu `username`. Koja god je pokrenuta poslednja — ta važi. U bazi je
-- ostala verzija bez korisničkog imena, pa su se uslovi korišćenja prepisivali
-- a korisničko ime tiho padalo.
--
-- Ime pritom nije izgubljeno: stoji u `auth.users.raw_user_meta_data`, jer ga
-- klijent uredno šalje kroz signUp. Zato drugi deo ove skripte vraća imena
-- svima kojima su propala.

-- ---------------------------------------------------------------------------
-- 1. Okidač koji radi oba posla
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  prihvaceno timestamptz;
  verzija    text;
  korisnicko text;
begin
  verzija := nullif(new.raw_user_meta_data ->> 'terms_version', '');
  begin
    prihvaceno := nullif(new.raw_user_meta_data ->> 'terms_accepted_at', '')::timestamptz;
  exception when others then
    prihvaceno := null;   -- neispravan datum ne sme da obori registraciju
  end;

  if verzija is null then
    prihvaceno := null;   -- datum bez verzije nema vrednost kao dokaz
  end if;

  korisnicko := nullif(btrim(new.raw_user_meta_data ->> 'username'), '');

  -- Kod Google prijave korisničkog imena nema; profil se pravi bez njega, a
  -- aplikacija ga zatraži pre prvog pisanja na forumu.
  insert into public.profiles (id, full_name, username, terms_accepted_at, terms_version)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    korisnicko,
    prihvaceno,
    verzija
  );
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Vraćanje imena onima kojima su propala
-- ---------------------------------------------------------------------------
--
-- Uzima se samo tamo gde profil nema ime, gde ga u metapodacima ima, gde je
-- oblik ispravan i gde ga niko drugi već ne koristi. Sve ostalo se preskače —
-- takvim nalozima aplikacija i dalje traži ime pre prvog pisanja na forumu.

update public.profiles p
set    username = kandidat.ime
from (
  select u.id,
         btrim(u.raw_user_meta_data ->> 'username') as ime
  from   auth.users u
  where  nullif(btrim(u.raw_user_meta_data ->> 'username'), '') is not null
) as kandidat
where  p.id = kandidat.id
  and  p.username is null
  and  public.proveri_korisnicko_ime(kandidat.ime) is null
  and  not exists (
         select 1 from public.profiles d
         where  lower(d.username) = lower(kandidat.ime)
           and  d.id <> p.id
       );

-- Provera: treba da vrati 0 redova kad je sve vraćeno.
-- select u.email, u.raw_user_meta_data ->> 'username' as iz_registracije
-- from   auth.users u
-- join   public.profiles p on p.id = u.id
-- where  p.username is null
--   and  nullif(btrim(u.raw_user_meta_data ->> 'username'), '') is not null;
