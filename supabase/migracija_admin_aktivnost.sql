-- Ko od korisnica zaista koristi aplikaciju.
--
-- Do sada se u administraciji videlo samo kad je ko otvorio nalog. To ne
-- govori ništa: nalog otvoren pre mesec dana i nedirnut od tada izgleda isto
-- kao onaj koji se koristi svakog dana.
--
-- Dva odvojena signala, jer znače različite stvari:
--   • poslednja prijava — kad je poslednji put otvorila aplikaciju
--   • poslednja aktivnost — kad je poslednji put nešto unela
-- Žena koja se prijavljuje ali ništa ne unosi je drugačiji problem od one
-- koja se više ne vraća.
--
-- `last_sign_in_at` stoji u `auth.users`, do koje aplikacija nema pristup —
-- zato je funkcija SECURITY DEFINER, uz proveru uloge unutra.

create or replace function public.admin_aktivnost()
returns table (
  id                  uuid,
  full_name           text,
  username            text,
  registrovana        timestamptz,
  poslednja_prijava   timestamptz,
  poslednja_aktivnost timestamptz,
  broj_unosa          bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Samo administrator';
  end if;

  return query
  with tr as (
    select p.id as pid, p.user_id from public.pregnancies p
  ),
  unosi as (
    select tr.user_id, s.created_at as kada from public.symptom_entries s join tr on tr.pid = s.pregnancy_id
    union all
    select tr.user_id, m.created_at from public.mood_entries m join tr on tr.pid = m.pregnancy_id
    union all
    select tr.user_id, w.created_at from public.weight_entries w join tr on tr.pid = w.pregnancy_id
    union all
    select tr.user_id, d.created_at from public.diary_entries d join tr on tr.pid = d.pregnancy_id
    union all
    select tr.user_id, a.created_at from public.appointments a join tr on tr.pid = a.pregnancy_id
    union all
    select tr.user_id, c.created_at from public.contractions c join tr on tr.pid = c.pregnancy_id
    union all
    select tr.user_id, l.taken_at from public.medication_logs l
           join public.medications med on med.id = l.medication_id
           join tr on tr.pid = med.pregnancy_id
    union all
    select ft.author_id, ft.created_at from public.forum_topics ft
    union all
    select fp.author_id, fp.created_at from public.forum_posts fp
    union all
    select dr.user_id, dr.created_at from public.doctor_reviews dr
  ),
  sazeto as (
    select unosi.user_id, max(unosi.kada) as poslednja, count(*) as ukupno
    from unosi group by unosi.user_id
  )
  select pr.id,
         pr.full_name,
         pr.username,
         pr.created_at,
         au.last_sign_in_at,
         sz.poslednja,
         coalesce(sz.ukupno, 0)
  from   public.profiles pr
  left   join auth.users au on au.id = pr.id
  left   join sazeto sz     on sz.user_id = pr.id
  where  pr.role = 'trudnica'          -- admina i moderatore ne merimo
  order  by coalesce(sz.poslednja, au.last_sign_in_at, pr.created_at) desc;
end;
$$;

revoke all     on function public.admin_aktivnost() from public;
grant  execute on function public.admin_aktivnost() to authenticated;
