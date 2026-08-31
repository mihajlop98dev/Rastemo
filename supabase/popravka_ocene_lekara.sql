-- ---------------------------------------------------------------------------
-- Popravka: ocena lekara se nije mogla sačuvati
--
-- Svaki pokušaj ostavljanja ocene padao je sa greškom
--   42P01: missing FROM-clause entry for table "d"
-- koja dolazi iz okidača što održava doctors.avg_rating i review_count.
-- Greška se nije videla ranije jer do danas nijedna ocena nije ni ostavljena.
--
-- Funkcija se ovde piše ponovo bez aliasa tabele, u najjednostavnijem obliku.
-- Pokreće se jednom, u Supabase SQL editoru.
-- ---------------------------------------------------------------------------

create or replace function public.refresh_doctor_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ciljni_lekar uuid := coalesce(new.doctor_id, old.doctor_id);
begin
  update public.doctors
     set avg_rating = coalesce(
           (select round(avg(rating)::numeric, 1)
              from public.doctor_reviews
             where doctor_id = ciljni_lekar), 0),
         review_count = (
           select count(*)
             from public.doctor_reviews
            where doctor_id = ciljni_lekar)
   where id = ciljni_lekar;

  return null;
end;
$$;

-- Okidač se ne dira — pokazuje na istu funkciju, koja je sada ispravna.

notify pgrst, 'reload schema';
