-- ---------------------------------------------------------------------------
-- Migracija 9: bez prihvaćenih uslova nema objavljivanja
--
-- Checkbox pri registraciji i modal u aplikaciji sprečavaju korišćenje app-a
-- bez pristanka, ali ne i upis mimo nje: anonKey stoji u pregledaču po dizajnu,
-- pa se /auth/v1/signup i REST API mogu pozvati direktno. Politike ispod
-- prenose to pravilo u samu bazu, gde ga ništa ne može zaobići.
--
-- Politike su RESTRICTIVE — spajaju se sa postojećima logičkim I, pa ne menjaju
-- nijedno postojeće pravilo, samo dodaju uslov.
--
-- Prijave (reports) namerno NISU obuhvaćene: prijava je zaštitna radnja i nema
-- razloga sprečiti nekoga da prijavi uvredljiv sadržaj.
-- ---------------------------------------------------------------------------

create or replace function public.has_accepted_terms()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.terms_accepted_at is not null
  );
$$;

revoke all on function public.has_accepted_terms() from public;
grant execute on function public.has_accepted_terms() to authenticated;

-- Zajednica
drop policy if exists "topics_require_terms" on public.forum_topics;
create policy "topics_require_terms" on public.forum_topics
  as restrictive for insert with check (public.has_accepted_terms());

drop policy if exists "posts_require_terms" on public.forum_posts;
create policy "posts_require_terms" on public.forum_posts
  as restrictive for insert with check (public.has_accepted_terms());

-- Ocene lekara — ovde je i najveći pravni rizik, pa uslovi moraju da važe
drop policy if exists "reviews_require_terms" on public.doctor_reviews;
create policy "reviews_require_terms" on public.doctor_reviews
  as restrictive for insert with check (public.has_accepted_terms());

-- Unos lekara i ustanova
drop policy if exists "doctors_require_terms" on public.doctors;
create policy "doctors_require_terms" on public.doctors
  as restrictive for insert with check (public.has_accepted_terms());

drop policy if exists "clinics_require_terms" on public.clinics;
create policy "clinics_require_terms" on public.clinics
  as restrictive for insert with check (public.has_accepted_terms());
