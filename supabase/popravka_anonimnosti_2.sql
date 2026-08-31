-- ---------------------------------------------------------------------------
-- Popravka popravke: oduzimanje prava na koloni nije delovalo
--
-- Prethodna migracija je uradila:
--   revoke select (author_id) on public.forum_topics from anon, authenticated;
-- ali to u PostgreSQL-u ne postiže ništa dok uloga ima SELECT nad CELOM tabelom
-- — pravo nad tabelom pokriva sve kolone i jače je od oduzimanja pojedinačne.
-- Provera posle nje je i dalje vraćala author_id, čak i bez prijave.
--
-- Ispravan redosled: oduzeti pravo nad tabelom, pa dodeliti izričito samo one
-- kolone koje smeju da se čitaju. Autor se izostavlja.
--
-- Pokreće se jednom, u Supabase SQL editoru, posle popravka_anonimnosti.sql.
-- ---------------------------------------------------------------------------

-- ---------- forum: teme ----------
revoke select on public.forum_topics from anon, authenticated;
grant  select (id, category_id, title, body, is_anonymous, is_pinned, reply_count, created_at)
  on public.forum_topics to anon, authenticated;

-- ---------- forum: odgovori ----------
revoke select on public.forum_posts from anon, authenticated;
grant  select (id, topic_id, body, is_anonymous, created_at)
  on public.forum_posts to anon, authenticated;

-- ---------- ocene lekara ----------
revoke select on public.doctor_reviews from anon, authenticated;
grant  select (id, doctor_id, rating, expertise, communication, kindness,
               dedication, wait_time, would_recommend, comment, is_anonymous, created_at)
  on public.doctor_reviews to anon, authenticated;

-- ---------- komentari na ocene ----------
revoke select on public.doctor_review_comments from anon, authenticated;
grant  select (id, review_id, body, is_anonymous, created_at)
  on public.doctor_review_comments to anon, authenticated;

-- Upis se ne dira: insert, update i delete i dalje rade, a ko sme šta određuje
-- RLS. Pogledi i funkcije iz prethodne migracije rade jer su security definer,
-- pa čitaju u ime vlasnika, a ne u ime korisnice.

notify pgrst, 'reload schema';
