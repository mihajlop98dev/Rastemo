-- ---------------------------------------------------------------------------
-- Komentari na ocene lekara
--
-- Ocene (doctor_reviews) već postoje. Ovim se dodaje mogućnost da druge
-- korisnice odgovore na tuđe iskustvo — takođe sa izborom anonimno ili javno.
--
-- Pokreće se jednom, u Supabase SQL editoru.
-- ---------------------------------------------------------------------------

create table if not exists public.doctor_review_comments (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.doctor_reviews (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (length(btrim(body)) > 0),
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists doctor_review_comments_review_idx
  on public.doctor_review_comments (review_id, created_at);

alter table public.doctor_review_comments enable row level security;

-- Čitaju svi; piše i briše samo autor. Isto kao kod samih ocena.
drop policy if exists "review_comments_public_select" on public.doctor_review_comments;
create policy "review_comments_public_select" on public.doctor_review_comments
  for select using (true);

drop policy if exists "review_comments_owner_insert" on public.doctor_review_comments;
create policy "review_comments_owner_insert" on public.doctor_review_comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "review_comments_owner_update" on public.doctor_review_comments;
create policy "review_comments_owner_update" on public.doctor_review_comments
  for update using (auth.uid() = user_id);

drop policy if exists "review_comments_owner_delete" on public.doctor_review_comments;
create policy "review_comments_owner_delete" on public.doctor_review_comments
  for delete using (auth.uid() = user_id);

-- Prihvatanje uslova je uslov za javno objavljivanje, isto kao na forumu.
drop policy if exists "review_comments_require_terms" on public.doctor_review_comments;
create policy "review_comments_require_terms" on public.doctor_review_comments
  as restrictive for insert with check (public.has_accepted_terms());

drop policy if exists "reviews_require_terms" on public.doctor_reviews;
create policy "reviews_require_terms" on public.doctor_reviews
  as restrictive for insert with check (public.has_accepted_terms());

-- ---------------------------------------------------------------------------
-- Ime autora uz ocenu, bez otkrivanja anonimnih
--
-- Klijent ne sme sam da spaja ocene sa profilima: ko ume da čita PostgREST
-- mogao bi da traži i user_id anonimne ocene. Zato ime vraća funkcija, i to
-- samo kada ocena nije anonimna.
-- ---------------------------------------------------------------------------
create or replace function public.ocene_lekara(p_doctor_id uuid)
returns table (
  id uuid,
  rating numeric,
  comment text,
  is_anonymous boolean,
  created_at timestamptz,
  autor text,
  moja boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select r.id,
         r.rating,
         r.comment,
         r.is_anonymous,
         r.created_at,
         case when r.is_anonymous then null else nullif(btrim(p.full_name), '') end,
         r.user_id = auth.uid()
    from public.doctor_reviews r
    join public.profiles p on p.id = r.user_id
   where r.doctor_id = p_doctor_id
   order by r.created_at desc;
$$;

create or replace function public.komentari_ocene(p_review_id uuid)
returns table (
  id uuid,
  body text,
  is_anonymous boolean,
  created_at timestamptz,
  autor text,
  moj boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select c.id,
         c.body,
         c.is_anonymous,
         c.created_at,
         case when c.is_anonymous then null else nullif(btrim(p.full_name), '') end,
         c.user_id = auth.uid()
    from public.doctor_review_comments c
    join public.profiles p on p.id = c.user_id
   where c.review_id = p_review_id
   order by c.created_at;
$$;

revoke all on function public.ocene_lekara(uuid) from public;
revoke all on function public.komentari_ocene(uuid) from public;
grant execute on function public.ocene_lekara(uuid) to authenticated;
grant execute on function public.komentari_ocene(uuid) to authenticated;

notify pgrst, 'reload schema';
