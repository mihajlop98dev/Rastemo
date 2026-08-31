-- ---------------------------------------------------------------------------
-- Popravka: anonimnost je bila samo na ekranu, ne u bazi
--
-- Šta je bilo pogrešno:
--   forum_topics, forum_posts, doctor_reviews i doctor_review_comments imaju
--   politiku "select using (true)", pa je svako ko ume da pozove PostgREST
--   mogao da pročita author_id / user_id i za unose označene kao anonimne.
--   Tabela profiles je čitljiva svima, pa se taj id spajanjem pretvarao u ime.
--   Kod foruma je bilo i gore: aplikacija je sama dovlačila profiles(full_name)
--   uz anonimne teme, pa je ime stizalo do pregledača, a ekran ga je samo krio.
--
-- Rešenje: pogledi koji ne izlažu autora anonimnih unosa, i oduzimanje prava
-- čitanja samih kolona sa autorom. Aplikacija dobija "autor" (ime ili prazno)
-- i "moja" (da li je unos njen), što joj je jedino i potrebno.
--
-- Pokreće se jednom, u Supabase SQL editoru.
-- ---------------------------------------------------------------------------

-- ---------- forum: teme ----------
create or replace view public.forum_teme_v as
select t.id,
       t.category_id,
       t.title,
       t.body,
       t.is_anonymous,
       t.is_pinned,
       t.reply_count,
       t.created_at,
       -- id autora se izdaje samo kad autor nije skriven; služi za slanje poruke
       case when t.is_anonymous then null else t.author_id end            as author_id,
       case when t.is_anonymous then null else nullif(btrim(p.full_name), '') end as autor,
       t.author_id = auth.uid()                                          as moja
  from public.forum_topics t
  join public.profiles p on p.id = t.author_id;

-- ---------- forum: odgovori ----------
create or replace view public.forum_odgovori_v as
select o.id,
       o.topic_id,
       o.body,
       o.is_anonymous,
       o.created_at,
       case when o.is_anonymous then null else o.author_id end            as author_id,
       case when o.is_anonymous then null else nullif(btrim(p.full_name), '') end as autor,
       o.author_id = auth.uid()                                          as moj
  from public.forum_posts o
  join public.profiles p on p.id = o.author_id;

grant select on public.forum_teme_v to anon, authenticated;
grant select on public.forum_odgovori_v to anon, authenticated;

-- ---------- oduzimanje prava na kolone sa autorom ----------
-- RLS radi nad redom i ne ume da sakrije kolonu; privilegija nad kolonom ume.
-- Upis ostaje dozvoljen, čita se samo kroz poglede iznad.
revoke select (author_id) on public.forum_topics            from anon, authenticated;
revoke select (author_id) on public.forum_posts             from anon, authenticated;
revoke select (user_id)   on public.doctor_reviews          from anon, authenticated;
revoke select (user_id)   on public.doctor_review_comments  from anon, authenticated;

-- ---------- obaveštavanje autora teme ----------
-- Kad neko odgovori na temu, autor treba da dobije obaveštenje — i onda kada je
-- tema anonimna. Aplikacija više ne zna ko je autor, pa poruku šalje baza.
create or replace function public.obavesti_autora_teme(
  p_topic_id uuid,
  p_naslov   text,
  p_telo     text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  autor uuid;
begin
  if auth.uid() is null then
    raise exception 'Potrebna je prijava';
  end if;

  select author_id into autor from public.forum_topics where id = p_topic_id;
  if autor is null or autor = auth.uid() then
    return;   -- nema teme, ili je odgovorila sama autorka
  end if;

  insert into public.notifications (user_id, type, title, body)
  values (autor, 'forum_reply', p_naslov, p_telo);
end;
$$;

revoke all on function public.obavesti_autora_teme(uuid, text, text) from public;
grant execute on function public.obavesti_autora_teme(uuid, text, text) to authenticated;

-- ---------- sadržaj za administraciju ----------
-- Administrator sme da vidi autora, ali samo kroz ovu funkciju i samo zato što
-- mora da zna kome izriče opomenu. Provera uloge je unutar same funkcije, pa
-- oduzimanje prava na kolone iznad ne remeti moderaciju.
create or replace function public.admin_sadrzaj()
returns table (
  id uuid,
  kind text,
  title text,
  body text,
  author_id uuid,
  author_name text,
  is_anonymous boolean,
  created_at timestamptz,
  context text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Samo administrator';
  end if;

  return query
    select t.id, 'topic'::text, t.title, t.body, t.author_id,
           coalesce(nullif(btrim(p.full_name), ''), 'Nepoznato'),
           t.is_anonymous, t.created_at, null::text
      from public.forum_topics t
      join public.profiles p on p.id = t.author_id
     union all
    select o.id, 'post'::text, null::text, o.body, o.author_id,
           coalesce(nullif(btrim(p2.full_name), ''), 'Nepoznato'),
           o.is_anonymous, o.created_at, tt.title
      from public.forum_posts o
      join public.profiles p2 on p2.id = o.author_id
      join public.forum_topics tt on tt.id = o.topic_id
     order by 8 desc
     limit 400;
end;
$$;

revoke all on function public.admin_sadrzaj() from public;
grant execute on function public.admin_sadrzaj() to authenticated;

-- ---------- profili ----------
-- Ime je i dalje čitljivo (treba za forum, poruke i ocene), ali sada više nema
-- id-a uz anonimni unos sa kojim bi se spojilo.

notify pgrst, 'reload schema';
