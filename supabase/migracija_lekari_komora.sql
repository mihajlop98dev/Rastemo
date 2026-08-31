-- ---------------------------------------------------------------------------
-- Migracija: podaci iz registra Lekarske komore Srbije
--
-- Registar licenciranih lekara Komora objavljuje javno, kao zakonsku obavezu,
-- upravo zato da bi svako mogao da proveri ko sme da se bavi praksom. Odatle
-- uzimamo samo ginekologe-akušere sa važećom licencom.
--
-- Registar nema grad ni ustanovu — ima ime, titulu, broj licence, specijalizaciju
-- i rok važenja. Grad i ustanovu dopunjuju korisnice kroz aplikaciju.
-- ---------------------------------------------------------------------------

alter table public.doctors
  add column if not exists license_number      text,
  add column if not exists title               text,
  add column if not exists subspecialty        text,
  add column if not exists academic_title      text,
  add column if not exists is_primarius        boolean not null default false,
  add column if not exists license_valid_until date,
  add column if not exists source              text;

comment on column public.doctors.license_number      is 'Broj licence u registru Lekarske komore Srbije';
comment on column public.doctors.title               is 'Titula iz registra (Spec. dr med., Prof. dr...)';
comment on column public.doctors.subspecialty        is 'Uža specijalizacija iz registra';
comment on column public.doctors.academic_title      is 'Naučno-nastavno zvanje iz registra';
comment on column public.doctors.is_primarius        is 'Nosi zvanje primarijusa';
comment on column public.doctors.license_valid_until is 'Datum do kog licenca važi';
comment on column public.doctors.source              is 'Odakle je unos: registar Komore ili korisnica aplikacije';

-- Isti lekar ne sme da udje dva puta. Uslov "where not null" ostavlja prostora
-- unosima korisnica, koje broj licence ne znaju.
create unique index if not exists doctors_license_number_uniq
  on public.doctors (license_number) where license_number is not null;

-- Pretraga ide po imenu preko ilike; bez ovoga bi svaki upit citao celu tabelu.
create extension if not exists pg_trgm;
create index if not exists doctors_full_name_trgm
  on public.doctors using gin (full_name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Dopuna unosa iz registra
--
-- Korisnica sme da doda grad i ustanovu lekaru koji ih jos nema, ali ne sme da
-- menja ime, licencu ni specijalizaciju. RLS radi nad redom, ne nad kolonom,
-- pa se ogranicenje sprovodi kroz funkciju umesto kroz "update" politiku.
-- ---------------------------------------------------------------------------
create or replace function public.dopuni_lekara(
  p_doctor_id uuid,
  p_city      text default null,
  p_clinic_id uuid default null
)
returns public.doctors
language plpgsql
security definer
set search_path = public
as $$
declare
  red public.doctors;
begin
  if auth.uid() is null then
    raise exception 'Potrebna je prijava';
  end if;

  update public.doctors d
     set city      = coalesce(d.city, nullif(btrim(p_city), '')),
         clinic_id = coalesce(d.clinic_id, p_clinic_id)
   where d.id = p_doctor_id
  returning * into red;

  if not found then
    raise exception 'Lekar nije pronadjen';
  end if;

  return red;
end;
$$;

revoke all on function public.dopuni_lekara(uuid, text, uuid) from public;
grant execute on function public.dopuni_lekara(uuid, text, uuid) to authenticated;

notify pgrst, 'reload schema';
