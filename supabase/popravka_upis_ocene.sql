-- ---------------------------------------------------------------------------
-- Upis ocene kroz funkciju
--
-- Pošto je oduzeto pravo čitanja kolone user_id (da anonimnost ne bi bila
-- probojna), upsert sa "on conflict (doctor_id, user_id)" više ne prolazi —
-- Postgres mora da pročita te kolone da bi razrešio sukob, pa vraća 403.
--
-- Zato upis radi funkcija: ona zna ko je pozivalac iz auth.uid(), pa se
-- user_id nikada ne šalje sa klijenta niti se odande čita.
--
-- Pokreće se jednom, u Supabase SQL editoru.
-- ---------------------------------------------------------------------------

create or replace function public.sacuvaj_ocenu(
  p_doctor_id uuid,
  p_rating    numeric,
  p_comment   text default null,
  p_anonimno  boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  ja  uuid := auth.uid();
  red uuid;
begin
  if ja is null then
    raise exception 'Potrebna je prijava';
  end if;
  if p_rating < 1 or p_rating > 5 then
    raise exception 'Ocena mora biti između 1 i 5';
  end if;
  if not public.has_accepted_terms() then
    raise exception 'Potrebno je prihvatiti uslove korišćenja';
  end if;

  insert into public.doctor_reviews (doctor_id, user_id, rating, comment, is_anonymous)
  values (p_doctor_id, ja, p_rating, nullif(btrim(p_comment), ''), p_anonimno)
  on conflict (doctor_id, user_id) do update
    set rating       = excluded.rating,
        comment      = excluded.comment,
        is_anonymous = excluded.is_anonymous
  returning id into red;

  return red;
end;
$$;

-- Brisanje svoje ocene: isti razlog, "where user_id = ..." traži čitanje kolone.
create or replace function public.obrisi_moju_ocenu(p_review_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Potrebna je prijava';
  end if;

  delete from public.doctor_reviews
   where id = p_review_id and user_id = auth.uid();
end;
$$;

create or replace function public.obrisi_moj_komentar(p_komentar_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Potrebna je prijava';
  end if;

  delete from public.doctor_review_comments
   where id = p_komentar_id and user_id = auth.uid();
end;
$$;

revoke all on function public.sacuvaj_ocenu(uuid, numeric, text, boolean) from public;
revoke all on function public.obrisi_moju_ocenu(uuid) from public;
revoke all on function public.obrisi_moj_komentar(uuid) from public;
grant execute on function public.sacuvaj_ocenu(uuid, numeric, text, boolean) to authenticated;
grant execute on function public.obrisi_moju_ocenu(uuid) to authenticated;
grant execute on function public.obrisi_moj_komentar(uuid) to authenticated;

notify pgrst, 'reload schema';
