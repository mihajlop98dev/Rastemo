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

-- Okidač je već zaveden ranijom migracijom i pokriva insert i update kolone
-- `username`; ovde se menja samo telo funkcije koju poziva.

-- Provera da je zaključavanje aktivno (treba da baci grešku):
-- update public.profiles set username = username || 'x' where id = auth.uid();
