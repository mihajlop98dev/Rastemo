-- Korisničko ime: potpis na forumu i drugi način prijave.
--
-- Do sada se na forumu prikazivalo ime i prezime iz profila. Dok je forum bio
-- zatvoren to je bilo u redu; kad postane javan, značilo bi da žena objavi
-- puno ime uz zdravstveni podatak, na Google-u, a da toga nije ni svesna.
-- Zato se na forumu potpisuje korisničkim imenom, a pravo ime ostaje u
-- dnevniku, gde mu je i mesto.

alter table public.profiles
  add column if not exists username text;

-- Jedinstveno bez obzira na velika i mala slova: „Marija" i „marija" ne smeju
-- da postoje jedno pored drugog, jer bi se na forumu činili istom osobom.
create unique index if not exists profiles_username_jedinstven
  on public.profiles (lower(username));

-- ---------------------------------------------------------------------------
-- Šta korisničko ime sme da bude
-- ---------------------------------------------------------------------------

create or replace function public.rezervisana_korisnicka_imena()
returns text[]
language sql
immutable
as $$
  select array[
    'admin','administrator','moderator','mod','podrska','support','pomoc',
    'dnevnik','dnevniktrudnoce','trudnoca','sistem','system','root','nalog',
    'korisnik','korisnica','anonimno','anoniman','anonimna','obrisan',
    'lekar','doktor','ordinacija','info','kontakt','office','noreply','test'
  ];
$$;

/**
 * Vraća poruku o grešci, ili null ako je ime ispravno.
 *
 * Pravila su namerno stroga: korisničko ime stoji uz zdravstvene teme na
 * javnom forumu, pa ne sme ni da liči na zvanični nalog ni da sadrži uvredu.
 */
create or replace function public.proveri_korisnicko_ime(p_ime text)
returns text
language plpgsql
immutable
as $$
declare
  ime text := btrim(coalesce(p_ime, ''));
begin
  if length(ime) < 3 then
    return 'Korisničko ime mora imati bar 3 znaka.';
  end if;
  if length(ime) > 20 then
    return 'Korisničko ime može imati najviše 20 znakova.';
  end if;

  -- Samo slova bez kvačica, brojevi, tačka, donja crta i crtica. Kvačice se
  -- ne dozvoljavaju jer se „miloš" i „milos" u adresi i pretrazi mešaju.
  if ime !~ '^[A-Za-z0-9._-]+$' then
    return 'Dozvoljena su slova bez kvačica, brojevi, tačka, crtica i donja crta.';
  end if;

  if ime !~ '^[A-Za-z0-9]' then
    return 'Korisničko ime mora da počne slovom ili brojem.';
  end if;
  if ime !~ '[A-Za-z0-9]$' then
    return 'Korisničko ime mora da se završi slovom ili brojem.';
  end if;

  -- Dva znaka za razdvajanje jedan uz drugi ostavljaju utisak greške u kucanju
  -- i olakšavaju pravljenje imena koje liči na tuđe.
  if ime ~ '[._-]{2,}' then
    return 'Tačka, crtica i donja crta ne smeju da stoje jedna uz drugu.';
  end if;

  -- Ime sastavljeno samo od cifara liči na broj naloga.
  if ime ~ '^[0-9]+$' then
    return 'Korisničko ime ne može da bude samo broj.';
  end if;

  if lower(ime) = any (public.rezervisana_korisnicka_imena()) then
    return 'To korisničko ime je rezervisano.';
  end if;

  -- Isti filter koji čuva unos lekara, ustanova i anketa.
  if public.sadrzi_nedozvoljeno(ime, true) then
    return 'To korisničko ime nije prihvatljivo.';
  end if;

  return null;
end;
$$;

-- Provera se izvršava i pri upisu iz aplikacije i pri svakoj kasnijoj izmeni.
create or replace function public.proveri_username_okidac()
returns trigger
language plpgsql
as $$
declare
  greska text;
begin
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

drop trigger if exists profiles_username_provera on public.profiles;
create trigger profiles_username_provera
  before insert or update of username on public.profiles
  for each row execute function public.proveri_username_okidac();

-- ---------------------------------------------------------------------------
-- Provera zauzetosti pre slanja registracije
-- ---------------------------------------------------------------------------

/**
 * Vraća true ako je ime slobodno.
 *
 * Namerno ne otkriva čije je ime zauzeto niti bilo šta drugo o nalogu —
 * samo da/ne. Bez ove provere žena bi ime saznala tek pošto joj registracija
 * padne.
 */
create or replace function public.korisnicko_ime_slobodno(p_ime text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.proveri_korisnicko_ime(p_ime) is null
     and not exists (
       select 1 from public.profiles
       where lower(username) = lower(btrim(p_ime))
     );
$$;

grant execute on function public.korisnicko_ime_slobodno(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Upis pri registraciji
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
    prihvaceno := null;
  end;

  if verzija is null then
    prihvaceno := null;
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
-- Prikaz na forumu
-- ---------------------------------------------------------------------------

-- Umesto punog imena, pogled sada izdaje korisničko ime. Ako ga nalog još
-- nema (stariji nalozi, Google prijava), prikazuje se samo prvo ime.
create or replace view public.forum_teme_v as
select t.id,
       t.category_id,
       t.title,
       t.body,
       t.is_anonymous,
       t.is_pinned,
       t.reply_count,
       t.created_at,
       case when t.is_anonymous then null else t.author_id end as author_id,
       case
         when t.is_anonymous then null
         else coalesce(
           nullif(btrim(p.username), ''),
           nullif(split_part(btrim(p.full_name), ' ', 1), ''),
           'Korisnica'
         )
       end as autor,
       t.author_id = auth.uid() as moja
  from public.forum_topics t
  join public.profiles p on p.id = t.author_id;

notify pgrst, 'reload schema';
