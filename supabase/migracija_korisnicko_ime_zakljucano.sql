-- Korisničko ime se bira jednom i posle se ne menja.
--
-- Zašto u bazi, kad aplikacija ionako ne nudi izmenu: polje se u Profilu
-- prikazuje samo dok je prazno, ali to je samo izgled. Sve dok baza prima
-- izmenu, dovoljan je jedan poziv API-ja da se ime promeni — a pod njim stoje
-- potpisane teme i odgovori na forumu. Ko je juče nešto napisao, ne sme
-- sutra da se pojavi pod tuđim imenom.
--
-- Administrator je izuzet: mora da može da ukloni uvredljivo ime.

create or replace function public.proveri_username_okidac()
returns trigger
language plpgsql
as $$
declare
  greska text;
begin
  -- Jednom izabrano ime je zaključano. `is distinct from` hvata i prelaz na
  -- NULL, pa se ime ne može ni obrisati da bi se zaobišla zabrana.
  if tg_op = 'UPDATE'
     and old.username is not null
     and new.username is distinct from old.username
     and not public.is_admin() then
    raise exception 'Korisničko ime se ne može menjati.';
  end if;

  if new.username is null then
    return new;
  end if;

  new.username := btrim(new.username);
  greska := public.proveri_korisnicko_ime(new.username);
  if greska is not null then
    raise exception '%', greska;
  end if;
  return new;
end;
$$;

-- Okidač se zavodi i ovde, ne samo funkcija.
--
-- Prva verzija ove skripte menjala je samo telo funkcije, uz pretpostavku da
-- je okidač zaveo `migracija_korisnicko_ime.sql`. Nije: provera se u bazi nije
-- okidala uopšte — prolazilo je i ime od dva znaka. Funkcija bez okidača je
-- mrtvo slovo, pa se okidač ovde zavodi izričito.
--
-- `drop ... if exists` čini skriptu ponovljivom: svejedno je da li okidač
-- postoji, fali ili je zastareo.

drop trigger if exists profiles_username_provera on public.profiles;
create trigger profiles_username_provera
  before insert or update of username on public.profiles
  for each row execute function public.proveri_username_okidac();

-- Provera 1 — zaključavanje (treba da baci „Korisničko ime se ne može menjati."):
-- update public.profiles set username = username || 'x' where id = auth.uid();
--
-- Provera 2 — oblik (treba da baci „mora imati bar 3 znaka"):
-- update public.profiles set username = 'ab' where id = auth.uid();
--
-- Provera 3 — da je okidač stvarno na tabeli (treba da vrati jedan red):
-- select tgname, tgenabled from pg_trigger
-- where tgrelid = 'public.profiles'::regclass and not tgisinternal;
