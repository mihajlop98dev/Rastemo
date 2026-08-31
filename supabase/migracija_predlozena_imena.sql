-- Imena koja korisnice upišu u anketu, a nema ih na našem spisku.
--
-- Ne ulaze nigde same od sebe — ovo je samo beleška za nas. Spisak govori
-- koja imena ljudima stvarno trebaju, pa se dopunjavanje radi po podacima
-- umesto po osećaju.

create table if not exists public.predlozena_imena (
  id uuid primary key default gen_random_uuid(),
  ime text not null unique,
  -- Koliko različitih anketa ga je sadržalo. Ime koje se ponovi više puta
  -- vredi dodati pre onog koje je uneto jednom.
  broj_unosa int not null default 1,
  prvi_put timestamptz not null default now(),
  poslednji_put timestamptz not null default now(),
  -- Postavlja admin kad ime prebaci u pravi spisak, da se ne obrađuje dvaput.
  obradjeno boolean not null default false
);

create index if not exists predlozena_imena_broj_idx
  on public.predlozena_imena (obradjeno, broj_unosa desc);

alter table public.predlozena_imena enable row level security;

-- Upisuje se kroz funkciju ispod, pa direktan upis nije potreban.
-- Čita samo admin.
drop policy if exists "predlozena_admin_cita" on public.predlozena_imena;
create policy "predlozena_admin_cita" on public.predlozena_imena for select
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'moderator')
  ));

drop policy if exists "predlozena_admin_menja" on public.predlozena_imena;
create policy "predlozena_admin_menja" on public.predlozena_imena for update
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

/**
 * Beleži ime van spiska.
 *
 * Ide kroz SECURITY DEFINER jer anketu pravi i neprijavljena korisnica, a
 * tabelu ne sme da čita niko osim admina. Funkcija samo broji — ne vraća
 * ništa i ne otkriva šta je u tabeli.
 */
create or replace function public.zabelezi_predlozeno_ime(p_ime text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cisto text := trim(p_ime);
begin
  if length(cisto) < 2 or length(cisto) > 30 then
    return;
  end if;
  if public.sadrzi_nedozvoljeno(cisto, true) then
    return;
  end if;

  insert into public.predlozena_imena (ime)
  values (cisto)
  on conflict (ime) do update
    set broj_unosa = public.predlozena_imena.broj_unosa + 1,
        poslednji_put = now();
end;
$$;

grant execute on function public.zabelezi_predlozeno_ime(text) to anon, authenticated;
