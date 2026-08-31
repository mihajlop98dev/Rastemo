-- ---------------------------------------------------------------------------
-- Migracija 7: admin panel — moderacija sadržaja, opomene i brisanje naloga
--
-- Tok koji ovo podržava:
--   1. admin obriše sporni komentar/temu i upiše razlog
--   2. autoru automatski stiže obaveštenje u aplikaciji: šta je obrisano,
--      gde, zbog čega, i upozorenje da nalog može biti trajno obrisan
--   3. svaka takva radnja je jedna opomena; posle tri, panel označava nalog
--      za brisanje
--
-- Namerno NE dodaje pristup zdravstvenim podacima (simptomi, raspoloženje,
-- težina, dnevnik, terapija) ni privatnim porukama. Politika privatnosti
-- kaže da im se ne pristupa i to ovde ostaje tako.
-- ---------------------------------------------------------------------------

-- Provera uloge kroz SECURITY DEFINER, da politike nad profiles ne bi
-- rekurzivno pozivale same sebe.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'moderator')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Dnevnik moderacije. Služi i kao brojač opomena po korisnici, i kao trag
-- ko je šta obrisao — bez njega brisanje ne bi moglo da se opravda kasnije.
create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  target_user_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('topic', 'post', 'review')),
  target_id uuid not null,
  -- Snimak obrisanog sadržaja; original više ne postoji, a mora da se zna
  -- šta je tačno uklonjeno ako korisnica ospori odluku.
  target_excerpt text not null,
  target_context text,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists moderation_actions_target_user_idx
  on public.moderation_actions (target_user_id);

alter table public.moderation_actions enable row level security;

drop policy if exists "moderation_actions_admin_all" on public.moderation_actions;
create policy "moderation_actions_admin_all" on public.moderation_actions
  for all using (public.is_admin()) with check (public.is_admin());

-- Admin vidi sve profile (spisak korisnica) i sme da ih obriše.
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles
  for select using (public.is_admin());

-- Moderacija sadržaja u Zajednici i ocena lekara.
drop policy if exists "topics_admin_delete" on public.forum_topics;
create policy "topics_admin_delete" on public.forum_topics
  for delete using (public.is_admin());

drop policy if exists "posts_admin_delete" on public.forum_posts;
create policy "posts_admin_delete" on public.forum_posts
  for delete using (public.is_admin());

drop policy if exists "reviews_admin_delete" on public.doctor_reviews;
create policy "reviews_admin_delete" on public.doctor_reviews
  for delete using (public.is_admin());

-- Lekare unose korisnice, pa admin mora da ih potvrdi, ispravi ili ukloni.
drop policy if exists "doctors_admin_update" on public.doctors;
create policy "doctors_admin_update" on public.doctors
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "doctors_admin_delete" on public.doctors;
create policy "doctors_admin_delete" on public.doctors
  for delete using (public.is_admin());

drop policy if exists "clinics_admin_update" on public.clinics;
create policy "clinics_admin_update" on public.clinics
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "clinics_admin_delete" on public.clinics;
create policy "clinics_admin_delete" on public.clinics
  for delete using (public.is_admin());

-- Red prijava koje šalju korisnice.
drop policy if exists "reports_admin_select" on public.reports;
create policy "reports_admin_select" on public.reports
  for select using (public.is_admin());

drop policy if exists "reports_admin_update" on public.reports;
create policy "reports_admin_update" on public.reports
  for update using (public.is_admin()) with check (public.is_admin());

-- Brisanje naloga mora da obriše i red u auth.users; RLS to ne može, pa ide
-- kroz SECURITY DEFINER funkciju koja sama proverava da je pozivalac admin.
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Nije dozvoljeno';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Ne mozes obrisati sopstveni nalog iz admin panela';
  end if;

  delete from auth.users where id = p_user_id;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;
