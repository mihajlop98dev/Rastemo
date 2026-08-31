-- ---------------------------------------------------------------------------
-- Migracija 8: tačne brojke u admin panelu
--
-- Panel je brojao redove preko običnih upita, pa je "aktivnih trudnoća"
-- pokazivalo 1 umesto 4: RLS nad pregnancies pušta samo sopstvene redove, a
-- admin nema pravo da vidi tuđe (i ne treba da ga ima — to su zdravstveni
-- podaci). Rešenje nije otvoriti tabelu, nego vratiti samo zbir: funkcija
-- ispod ne otkriva nijedan red, samo brojeve.
-- ---------------------------------------------------------------------------
create or replace function public.admin_stats()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare result json;
begin
  if not public.is_admin() then
    raise exception 'Nije dozvoljeno';
  end if;

  select json_build_object(
    'users',             (select count(*) from public.profiles),
    'newUsers7d',        (select count(*) from public.profiles where created_at >= now() - interval '7 days'),
    'pregnancies',       (select count(*) from public.pregnancies where is_active),
    'topics',            (select count(*) from public.forum_topics),
    'posts',             (select count(*) from public.forum_posts),
    'doctors',           (select count(*) from public.doctors),
    'unverifiedDoctors', (select count(*) from public.doctors where not is_verified),
    'pendingReports',    (select count(*) from public.reports where status = 'pending')
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_stats() from public;
grant execute on function public.admin_stats() to authenticated;
