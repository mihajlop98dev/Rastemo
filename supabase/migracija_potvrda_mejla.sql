-- ---------------------------------------------------------------------------
-- Potvrda mejla pri registraciji
--
-- Kada je u Supabase uključeno "Confirm email", signUp() više ne vraća sesiju —
-- korisnica nije prijavljena dok ne klikne na link iz mejla. Zbog toga
-- aplikacija ne može odmah posle registracije da upiše prihvatanje uslova
-- (nema auth.uid(), pa RLS odbija upis).
--
-- Rešenje: prihvatanje putuje kroz metapodatke naloga i upisuje ga okidač koji
-- ionako pravi profil. Tako ostaje zabeležen tačan trenutak prihvatanja, onaj
-- pri registraciji, a ne trenutak prve prijave.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  prihvaceno timestamptz;
  verzija    text;
  korisnicko text;
begin
  -- Vrednosti stižu iz signUp(options.data). Ako ih nema (npr. Google prijava),
  -- kolone ostaju prazne i modal u aplikaciji zatraži prihvatanje.
  verzija := nullif(new.raw_user_meta_data ->> 'terms_version', '');
  begin
    prihvaceno := nullif(new.raw_user_meta_data ->> 'terms_accepted_at', '')::timestamptz;
  exception when others then
    prihvaceno := null;   -- neispravan datum ne sme da obori registraciju
  end;

  if verzija is null then
    prihvaceno := null;   -- datum bez verzije nema vrednost kao dokaz
  end if;

  -- Korisničko ime mora da ostane i u ovoj verziji funkcije. Ranije ga ovde
  -- nije bilo, pa je ponovno pokretanje ovog fajla brisalo ono što je dodala
  -- `migracija_korisnicko_ime.sql` — obe menjaju istu funkciju, a važi ona
  -- koja je pokrenuta poslednja.
  korisnicko := nullif(btrim(new.raw_user_meta_data ->> 'username'), '');

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

notify pgrst, 'reload schema';
