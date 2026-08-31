-- Dve sitnije stvari iz bezbednosnog pregleda.
--
-- Nijedna nije rupa kroz koju se ulazi; obe su stvar higijene.

-- ---------------------------------------------------------------------------
-- 1. Ograničenje unosa predloženih imena
-- ---------------------------------------------------------------------------
--
-- `zabelezi_predlozeno_ime` je otvorena i neprijavljenima, jer se u anketi za
-- ime glasa bez naloga. Ima proveru dužine i filter psovki, ali ništa nije
-- sprečavalo da neko u petlji ubaci hiljade besmislenih imena i zatrpa spisak
-- koji admin pregleda.
--
-- Ograničenje je namerno globalno, po satu, a ne po korisniku: neprijavljeni
-- posetilac se ni ne može identifikovati, a IP adresa u ovom sloju ne postoji.
-- Ime koje već postoji samo uvećava brojač i ne pravi nov red, pa normalno
-- korišćenje nikad ne dodirne granicu.

create or replace function public.zabelezi_predlozeno_ime(p_ime text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cisto  text := trim(p_ime);
  skoro  int;
begin
  if length(cisto) < 2 or length(cisto) > 30 then
    return;
  end if;
  if public.sadrzi_nedozvoljeno(cisto, true) then
    return;
  end if;

  -- Ako ime već postoji, ide se na uvećanje brojača bez provere granice.
  if not exists (select 1 from public.predlozena_imena where ime = cisto) then
    select count(*) into skoro
    from   public.predlozena_imena
    where  prvi_put > now() - interval '1 hour';

    if skoro >= 40 then
      return;   -- tiho: posetilac ne treba da zna da postoji granica
    end if;
  end if;

  insert into public.predlozena_imena (ime)
  values (cisto)
  on conflict (ime) do update
    set broj_unosa = public.predlozena_imena.broj_unosa + 1,
        poslednji_put = now();
end;
$$;

grant execute on function public.zabelezi_predlozeno_ime(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Prihvatanje uslova se upisuje na serveru
-- ---------------------------------------------------------------------------
--
-- Do sada je aplikacija slala i datum: `update profiles set
-- terms_accepted_at = <sta god klijent posalje>`. Korisnica je time mogla da
-- upiše bilo koji datum u svoje ime. To nije rupa u bezbednosti, ali jeste u
-- dokazu — a taj zapis postoji baš zato da bude dokaz.
--
-- Sada datum postavlja baza, a kolone se aplikaciji oduzimaju, pa je funkcija
-- ispod jedini put do njih.

create or replace function public.prihvati_uslove(p_verzija text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  verzija text := btrim(coalesce(p_verzija, ''));
begin
  if auth.uid() is null then
    raise exception 'Potrebna je prijava';
  end if;
  if verzija = '' or length(verzija) > 20 then
    raise exception 'Verzija uslova nije ispravna';
  end if;

  update public.profiles
  set    terms_accepted_at = now(),   -- vreme dolazi iz baze, ne od klijenta
         terms_version     = verzija
  where  id = auth.uid();
end;
$$;

revoke all     on function public.prihvati_uslove(text) from public;
grant  execute on function public.prihvati_uslove(text) to authenticated;

-- Posle ovoga je funkcija jedini put do te dve kolone.
revoke update (terms_accepted_at, terms_version) on public.profiles from anon, authenticated;

-- Provera (kao obična korisnica treba da baci gresku o dozvolama):
-- update public.profiles set terms_accepted_at = '2020-01-01' where id = auth.uid();
