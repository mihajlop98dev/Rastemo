-- Korisnica ne sme sama sebi da promeni ulogu.
--
-- Rupa: politika `profiles_update_own` dozvoljava izmenu sopstvenog reda —
--
--   create policy "profiles_update_own" on public.profiles
--     for update using (auth.uid() = id);
--
-- — bez ograničenja koje kolone smeju da se menjaju. A u tom redu stoji i
-- `role`. Pošto `authenticated` po podrazumevanom podešavanju ima UPDATE nad
-- svim kolonama tabele, dovoljan je jedan poziv PostgREST-a:
--
--   PATCH /rest/v1/profiles?id=eq.<svoj-id>   {"role": "admin"}
--
-- Aplikacija to nigde ne nudi, ali napadaču aplikacija i ne treba — anon ključ
-- je javan i stoji u bundle-u, kako i treba. Posle toga bi imao pristup
-- administraciji: tuđim profilima, brisanju naloga i celom forumu.
--
-- Zaštita je okidač, a ne oduzimanje prava nad kolonom, da bi administrator i
-- dalje mogao da postavi moderatora.

create or replace function public.zastiti_ulogu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Uloga se ne može menjati.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_zastita_uloge on public.profiles;
create trigger profiles_zastita_uloge
  before update of role on public.profiles
  for each row execute function public.zastiti_ulogu();

-- Provera (kao obična korisnica treba da baci „Uloga se ne može menjati."):
-- update public.profiles set role = 'admin' where id = auth.uid();
--
-- Provera da je okidač zaveden:
-- select tgname from pg_trigger
-- where tgrelid = 'public.profiles'::regclass and not tgisinternal;
