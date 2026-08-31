-- Odgovori na forumu takođe potpisuje korisničko ime.
--
-- Prethodna migracija je promenila samo pogled sa temama, pa su odgovori
-- nastavili da prikazuju ime i prezime iz profila — baš ono što je trebalo
-- skloniti sa javnog foruma.

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
           -- Nalozi bez korisničkog imena (stariji, Google prijava) potpisuju
           -- se samo prvim imenom dok ga ne postave.
           nullif(split_part(btrim(p.full_name), ' ', 1), ''),
           'Korisnica'
         )
       end as autor,
       o.author_id = auth.uid() as moj
  from public.forum_posts o
  join public.profiles p on p.id = o.author_id;

grant select on public.forum_odgovori_v to anon, authenticated;

notify pgrst, 'reload schema';
