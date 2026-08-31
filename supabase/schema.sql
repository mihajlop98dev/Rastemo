-- ============================================================
-- Dnevnik trudnoće — Supabase schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILES (1:1 with auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  city text,
  avatar_url text,
  birth_date date,
  height_cm smallint,
  weight_kg numeric(5,2),
  role text not null default 'trudnica' check (role in ('trudnica', 'partner', 'lekar', 'moderator', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- PREGNANCIES
-- ------------------------------------------------------------
create table public.pregnancies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_period_date date,
  confirmed_date date,
  due_date date not null,
  conception_method text default 'natural' check (conception_method in ('natural', 'ivf')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index on public.pregnancies (user_id);

-- ------------------------------------------------------------
-- PARTNER CONNECTIONS
-- ------------------------------------------------------------
create table public.partner_connections (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies (id) on delete cascade,
  partner_user_id uuid references public.profiles (id) on delete cascade,
  -- Denormalized copy of pregnancies.user_id, set at insert time. Lets the
  -- owner-side RLS policy avoid querying pregnancies, which would otherwise
  -- recurse with pregnancies_partner_select (pregnancies -> partner_connections
  -- -> pregnancies causes "infinite recursion detected in policy").
  owner_user_id uuid references public.profiles (id) on delete cascade,
  invite_email text,
  permissions jsonb not null default '{"week": true, "due_date": true, "next_appointment": true, "checklists": true, "symptoms": false, "notes": false}',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now()
);

create index on public.partner_connections (pregnancy_id);
create index on public.partner_connections (partner_user_id);

-- ------------------------------------------------------------
-- TRACKING: symptoms, mood, weight, diary
-- ------------------------------------------------------------
create table public.symptom_entries (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies (id) on delete cascade,
  name text not null,
  level smallint not null check (level between 1 and 3),
  logged_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index on public.symptom_entries (pregnancy_id, logged_date);

create table public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies (id) on delete cascade,
  mood smallint not null check (mood between 1 and 5),
  note text,
  logged_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index on public.mood_entries (pregnancy_id, logged_date);

create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies (id) on delete cascade,
  weight_kg numeric(5,2) not null,
  logged_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index on public.weight_entries (pregnancy_id, logged_date);

create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies (id) on delete cascade,
  entry_type text not null default 'note' check (entry_type in ('note', 'photo', 'memory', 'exam_note', 'doctor_question')),
  title text,
  content text,
  photo_url text,
  created_at timestamptz not null default now()
);

create index on public.diary_entries (pregnancy_id);

-- ------------------------------------------------------------
-- CLINICS & DOCTORS
-- ------------------------------------------------------------
create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  address text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  specialty text not null,
  city text,
  clinic_id uuid references public.clinics (id) on delete set null,
  added_by uuid references public.profiles (id) on delete set null,
  is_verified boolean not null default false,
  avg_rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now()
);

create index on public.doctors (city);
create index on public.doctors (specialty);

create table public.doctor_reviews (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating numeric(2,1) not null check (rating between 1 and 5),
  expertise smallint check (expertise between 1 and 5),
  communication smallint check (communication between 1 and 5),
  kindness smallint check (kindness between 1 and 5),
  dedication smallint check (dedication between 1 and 5),
  wait_time smallint check (wait_time between 1 and 5),
  would_recommend boolean default true,
  comment text,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  unique (doctor_id, user_id)
);

create index on public.doctor_reviews (doctor_id);

-- keep doctors.avg_rating / review_count in sync
create or replace function public.refresh_doctor_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_doctor uuid := coalesce(new.doctor_id, old.doctor_id);
begin
  -- bez aliasa: alias "d" je obarao ceo upis ocene sa 42P01
  update public.doctors
  set avg_rating = coalesce((select round(avg(rating)::numeric, 1) from public.doctor_reviews where doctor_id = target_doctor), 0),
      review_count = (select count(*) from public.doctor_reviews where doctor_id = target_doctor)
  where id = target_doctor;
  return null;
end;
$$;

create trigger doctor_reviews_after_change
  after insert or update or delete on public.doctor_reviews
  for each row execute procedure public.refresh_doctor_rating();

-- ------------------------------------------------------------
-- APPOINTMENTS & DOCUMENTS
-- ------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies (id) on delete cascade,
  title text not null,
  subtitle text,
  appointment_type text not null default 'pregled' check (appointment_type in ('pregled', 'analize', 'ultrazvuk', 'ostalo')),
  doctor_id uuid references public.doctors (id) on delete set null,
  clinic_id uuid references public.clinics (id) on delete set null,
  scheduled_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);

create index on public.appointments (pregnancy_id, scheduled_at);

create table public.medical_documents (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  category text not null default 'ostalo' check (category in ('ultrazvuk', 'laboratorija', 'analize', 'izvestaji', 'otpusne_liste', 'ostalo')),
  file_name text not null,
  file_url text not null,
  uploaded_at timestamptz not null default now()
);

create index on public.medical_documents (pregnancy_id);

-- ------------------------------------------------------------
-- COMMUNITY / FORUM
-- ------------------------------------------------------------
create table public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.forum_categories (id) on delete restrict,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  is_anonymous boolean not null default false,
  is_pinned boolean not null default false,
  reply_count int not null default 0,
  created_at timestamptz not null default now()
);

create index on public.forum_topics (category_id);

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.forum_posts (topic_id);

create or replace function public.bump_topic_reply_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.forum_topics set reply_count = reply_count + 1 where id = new.topic_id;
  elsif (tg_op = 'DELETE') then
    update public.forum_topics set reply_count = greatest(reply_count - 1, 0) where id = old.topic_id;
  end if;
  return null;
end;
$$;

create trigger forum_posts_after_change
  after insert or delete on public.forum_posts
  for each row execute procedure public.bump_topic_reply_count();

create table public.saved_topics (
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic_id uuid not null references public.forum_topics (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

-- ------------------------------------------------------------
-- ------------------------------------------------------------
-- CHECKLISTS
-- ------------------------------------------------------------
create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies (id) on delete cascade,
  type text not null check (type in ('porodiliste', 'kupovina', 'porodjaj', 'kuca', 'custom')),
  title text not null,
  created_at timestamptz not null default now()
);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists (id) on delete cascade,
  group_name text not null default 'Ostalo',
  label text not null,
  is_done boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index on public.checklist_items (checklist_id);

-- ------------------------------------------------------------
-- REMINDERS & NOTIFICATIONS
-- ------------------------------------------------------------
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  remind_at timestamptz not null,
  related_type text,
  related_id uuid,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.reminders (user_id, remind_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.notifications (user_id, is_read);

-- ------------------------------------------------------------
-- MODERATION
-- ------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('topic', 'post', 'review', 'doctor')),
  target_id uuid not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.pregnancies enable row level security;
alter table public.partner_connections enable row level security;
alter table public.symptom_entries enable row level security;
alter table public.mood_entries enable row level security;
alter table public.weight_entries enable row level security;
alter table public.diary_entries enable row level security;
alter table public.clinics enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_reviews enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_documents enable row level security;
alter table public.forum_categories enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_posts enable row level security;
alter table public.saved_topics enable row level security;
alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;
alter table public.reminders enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- profiles: readable by self + connected partner, writable by self
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- pregnancies: owner full access; accepted partner can read
create policy "pregnancies_owner_all" on public.pregnancies for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "pregnancies_partner_select" on public.pregnancies for select
  using (exists (
    select 1 from public.partner_connections pc
    where pc.pregnancy_id = pregnancies.id
      and pc.partner_user_id = auth.uid()
      and pc.status = 'accepted'
  ));

-- partner_connections: owner (via denormalized owner_user_id) and the invited partner can see/manage
create policy "partner_connections_owner_all" on public.partner_connections for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "partner_connections_partner_select" on public.partner_connections for select
  using (partner_user_id = auth.uid());

create policy "partner_connections_partner_accept" on public.partner_connections for update
  using (partner_user_id = auth.uid());

-- generic helper pattern for pregnancy-scoped private tables
create policy "symptoms_owner_all" on public.symptom_entries for all
  using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()));

create policy "mood_owner_all" on public.mood_entries for all
  using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()));

create policy "weight_owner_all" on public.weight_entries for all
  using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()));

create policy "diary_owner_all" on public.diary_entries for all
  using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()));

create policy "documents_owner_all" on public.medical_documents for all
  using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()));

create policy "appointments_owner_all" on public.appointments for all
  using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()));

create policy "appointments_partner_select" on public.appointments for select
  using (exists (
    select 1 from public.partner_connections pc
    where pc.pregnancy_id = appointments.pregnancy_id
      and pc.partner_user_id = auth.uid()
      and pc.status = 'accepted'
      and coalesce((pc.permissions ->> 'next_appointment')::boolean, false)
  ));

create policy "checklists_owner_all" on public.checklists for all
  using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()));

create policy "checklist_items_owner_all" on public.checklist_items for all
  using (exists (
    select 1 from public.checklists c
    join public.pregnancies p on p.id = c.pregnancy_id
    where c.id = checklist_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.checklists c
    join public.pregnancies p on p.id = c.pregnancy_id
    where c.id = checklist_id and p.user_id = auth.uid()
  ));

-- doctors / clinics / reviews: public read, authenticated write
create policy "clinics_public_select" on public.clinics for select using (true);
create policy "clinics_authenticated_insert" on public.clinics for insert with check (auth.role() = 'authenticated');

create policy "doctors_public_select" on public.doctors for select using (true);
create policy "doctors_authenticated_insert" on public.doctors for insert with check (auth.role() = 'authenticated');

create policy "reviews_public_select" on public.doctor_reviews for select using (true);
create policy "reviews_owner_write" on public.doctor_reviews for insert with check (auth.uid() = user_id);
create policy "reviews_owner_update" on public.doctor_reviews for update using (auth.uid() = user_id);
create policy "reviews_owner_delete" on public.doctor_reviews for delete using (auth.uid() = user_id);

-- forum: public read, authenticated write, owner edit/delete
create policy "categories_public_select" on public.forum_categories for select using (true);

create policy "topics_public_select" on public.forum_topics for select using (true);
create policy "topics_authenticated_insert" on public.forum_topics for insert with check (auth.uid() = author_id);
create policy "topics_owner_update" on public.forum_topics for update using (auth.uid() = author_id);
create policy "topics_owner_delete" on public.forum_topics for delete using (auth.uid() = author_id);

create policy "posts_public_select" on public.forum_posts for select using (true);
create policy "posts_authenticated_insert" on public.forum_posts for insert with check (auth.uid() = author_id);
create policy "posts_owner_update" on public.forum_posts for update using (auth.uid() = author_id);
create policy "posts_owner_delete" on public.forum_posts for delete using (auth.uid() = author_id);

create policy "saved_topics_owner_all" on public.saved_topics for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reminders & notifications: private to owner
create policy "reminders_owner_all" on public.reminders for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notifications_owner_all" on public.notifications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reports: reporter can insert/select own; reviewed by moderators/admins via service role or future policy
create policy "reports_reporter_insert" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reports_reporter_select" on public.reports for select using (auth.uid() = reporter_id);

-- ============================================================
-- FAVORITES, DIRECT MESSAGES (migration 2)
-- ============================================================

create table public.favorite_doctors (
  user_id uuid not null references public.profiles (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, doctor_id)
);

alter table public.favorite_doctors enable row level security;
create policy "favorite_doctors_owner_all" on public.favorite_doctors for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles (id) on delete cascade,
  user_b_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a_id, user_b_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "conversations_participant_all" on public.conversations for all
  using (auth.uid() = user_a_id or auth.uid() = user_b_id)
  with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "messages_participant_select" on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
  ));

create policy "messages_sender_insert" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

create policy "messages_participant_update" on public.messages for update
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
  ));

-- profiles: default visibility preference for new forum topics
alter table public.profiles add column default_anonymous boolean not null default false;

-- notifications: any authenticated user can notify another user (forum replies, DMs);
-- read/update/delete stay scoped to the owner.
drop policy if exists "notifications_owner_all" on public.notifications;
create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_insert_any" on public.notifications for insert with check (auth.role() = 'authenticated');
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id);
create policy "notifications_delete_own" on public.notifications for delete using (auth.uid() = user_id);
-- ============================================================
-- BABY NAME/GENDER, CONTRACTIONS, MEDICATIONS (migration 3)
-- ============================================================

alter table public.pregnancies
  add column if not exists baby_name text,
  add column if not exists baby_gender text check (baby_gender in ('musko','zensko','nepoznato')),
  add column if not exists pre_pregnancy_weight_kg numeric;

create table public.contractions (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  started_at timestamptz not null,
  duration_seconds integer not null,
  created_at timestamptz not null default now()
);
alter table public.contractions enable row level security;
create policy "contractions_owner_all" on public.contractions for all
  using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()));

create table public.medications (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  name text not null,
  type text not null check (type in ('terapija','suplement')),
  dose_per_day integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.medications enable row level security;
create policy "medications_owner_all" on public.medications for all
  using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()));

create table public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  taken_at timestamptz not null default now()
);
alter table public.medication_logs enable row level security;
create policy "medication_logs_owner_all" on public.medication_logs for all
  using (exists (select 1 from public.medications m join public.pregnancies p on p.id = m.pregnancy_id where m.id = medication_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.medications m join public.pregnancies p on p.id = m.pregnancy_id where m.id = medication_id and p.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Migracija 4: prihvatanje uslova korišćenja
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text;

-- ---------------------------------------------------------------------------
-- Migracija 5: sopstveni simptomi koje korisnica sama dodaje
-- ---------------------------------------------------------------------------
create table if not exists public.custom_symptoms (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies(id) on delete cascade,
  name text not null,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (pregnancy_id, name)
);
alter table public.custom_symptoms enable row level security;
create policy "custom_symptoms_owner_all" on public.custom_symptoms for all
  using (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.pregnancies p where p.id = pregnancy_id and p.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Migracija 6: porodilište koje je korisnica izabrala
-- ---------------------------------------------------------------------------
alter table public.pregnancies
  add column if not exists birth_facility_id uuid references public.clinics(id) on delete set null;
