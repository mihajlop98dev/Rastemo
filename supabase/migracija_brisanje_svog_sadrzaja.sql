-- Autor sme da ukloni svoj sadržaj sa foruma.
--
-- Do sada je brisanje mogao samo admin. Otkad je forum javan i indeksiran,
-- to je i pravna obaveza a ne udobnost: čovek ima pravo da povuče ono što je
-- o sebi objavio.
--
-- Anonimne teme i odgovori se brišu isto — pravo ima onaj ko je pisao, bez
-- obzira na to kako je potpisano.

drop policy if exists "posts_author_delete" on public.forum_posts;
create policy "posts_author_delete" on public.forum_posts for delete
  using (auth.uid() = author_id);

drop policy if exists "topics_author_delete" on public.forum_topics;
create policy "topics_author_delete" on public.forum_topics for delete
  using (auth.uid() = author_id);

-- Uklanjanje teksta uz zadržavanje reda: tema sa odgovorima se ne briše, jer
-- bi sa njom nestali i tuđi odgovori.
alter table public.forum_topics
  add column if not exists uklonjeno_u timestamptz;

alter table public.forum_posts
  add column if not exists uklonjeno_u timestamptz;

drop policy if exists "topics_author_update" on public.forum_topics;
create policy "topics_author_update" on public.forum_topics for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

/**
 * Uklanja tekst teme, a red ostaje da bi odgovori imali gde da stoje.
 *
 * Ide kroz funkciju a ne kroz običan update: tako se u jednom mestu drži
 * pravilo šta se briše (naslov i telo) a šta ostaje (vreme, kategorija),
 * i ne može se slučajno izmeniti tuđa tema.
 */
create or replace function public.ukloni_svoju_temu(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  vlasnik uuid;
  ima_odgovora int;
begin
  select author_id into vlasnik from public.forum_topics where id = p_id;
  if vlasnik is null or vlasnik <> auth.uid() then
    raise exception 'Nije tvoja tema.';
  end if;

  select count(*) into ima_odgovora from public.forum_posts where topic_id = p_id;

  if ima_odgovora = 0 then
    delete from public.forum_topics where id = p_id;
  else
    update public.forum_topics
       set title = 'Uklonjena tema',
           body = null,
           uklonjeno_u = now()
     where id = p_id;
  end if;
end;
$$;

grant execute on function public.ukloni_svoju_temu(uuid) to authenticated;

-- Pogledi izdaju i oznaku uklanjanja, da aplikacija zna šta da prikaže.
create or replace view public.forum_teme_v as
select t.id,
       t.category_id,
       t.title,
       t.body,
       t.is_anonymous,
       t.is_pinned,
       t.reply_count,
       t.created_at,
       case when t.is_anonymous then null else t.author_id end as author_id,
       case
         when t.is_anonymous then null
         else coalesce(
           nullif(btrim(p.username), ''),
           nullif(split_part(btrim(p.full_name), ' ', 1), ''),
           'Korisnica'
         )
       end as autor,
       t.author_id = auth.uid() as moja,
       -- Nova kolona ide na kraj: `create or replace view` ne dozvoljava da
       -- se postojece pomere sa svojih mesta.
       t.uklonjeno_u
  from public.forum_topics t
  join public.profiles p on p.id = t.author_id;

create or replace view public.forum_odgovori_v as
select o.id,
       o.topic_id,
       o.body,
       o.is_anonymous,
       o.created_at,
       case when o.is_anonymous then null else o.author_id end as author_id,
       case
         when o.is_anonymous then null
         else coalesce(
           nullif(btrim(p.username), ''),
           nullif(split_part(btrim(p.full_name), ' ', 1), ''),
           'Korisnica'
         )
       end as autor,
       o.author_id = auth.uid() as moj,
       o.uklonjeno_u
  from public.forum_posts o
  join public.profiles p on p.id = o.author_id;

grant select on public.forum_teme_v to anon, authenticated;
grant select on public.forum_odgovori_v to anon, authenticated;

notify pgrst, 'reload schema';
