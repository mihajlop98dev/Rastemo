-- Push administratoru čim se neko registruje.
--
-- Okidač šalje zahtev Edge funkciji preko pg_net, odmah po upisu profila.
-- Ključ se ne upisuje ovde nego se čita iz Vault-a u trenutku izvršavanja —
-- isti onaj koji već koristi zakazani posao za podsetnike. Tako ključ ne
-- stoji otvoren u definiciji okidača, koju vidi svako ko ume da pročita
-- sistemske tabele.
--
-- Napomena: profil nastaje pri registraciji, pre potvrde mejla. Znači
-- obaveštenje stiže i za naloge koji potvrdu nikad ne završe. Tako se vidi i
-- kad neko odustane na pola, što je za sada korisnije nego tiše.

create extension if not exists pg_net with schema extensions;

create or replace function public.javi_adminu_za_novu_korisnicu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  kljuc text;
begin
  select decrypted_secret into kljuc
  from   vault.decrypted_secrets
  where  name = 'service_role_kljuc';

  -- Bez ključa se ništa ne šalje, ali registracija mora da prođe. Obaveštenje
  -- administratoru nije vrednije od naloga korisnice.
  if kljuc is null then
    return new;
  end if;

  perform net.http_post(
    url     := 'https://wwippvsdyoexnheihzqg.supabase.co/functions/v1/posalji-push-admin',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || kljuc
    ),
    body    := jsonb_build_object('user_id', new.id)
  );

  return new;
exception when others then
  -- pg_net je asinhron i retko puca, ali ako pukne — registracija se ne sme
  -- srušiti zbog notifikacije.
  return new;
end;
$$;

drop trigger if exists profiles_javi_adminu on public.profiles;
create trigger profiles_javi_adminu
  after insert on public.profiles
  for each row execute function public.javi_adminu_za_novu_korisnicu();

-- Provera da je okidač zaveden (treba da vrati red `profiles_javi_adminu`):
-- select tgname from pg_trigger
-- where tgrelid = 'public.profiles'::regclass and not tgisinternal;
