-- ---------------------------------------------------------------------------
-- Uklanjanje AI pomoćnika iz baze
--
-- Aplikacija više ne nudi AI pomoćnika, pa ove tabele nemaju ko da puni ni čita.
--
-- PAŽNJA: ovo TRAJNO briše sve razgovore koje su korisnice vodile sa pomoćnikom.
-- Nema povratka. Ako želiš da ih prvo sačuvaš, izvezi ih pre pokretanja:
--
--   select c.user_id, c.created_at, m.role, m.content
--     from public.ai_messages m
--     join public.ai_conversations c on c.id = m.conversation_id
--    order by c.created_at, m.created_at;
--
-- Pokreće se jednom, u Supabase SQL editoru.
-- ---------------------------------------------------------------------------

-- ai_messages ima strani ključ ka ai_conversations, pa "cascade" skida i njega
drop table if exists public.ai_messages cascade;
drop table if exists public.ai_conversations cascade;

-- Baza znanja za RAG, iz verzije pomoćnika koja je odgovarala iz naših tekstova
drop function if exists public.match_knowledge(vector, int, float);
drop function if exists public.match_knowledge(vector, int);
drop table if exists public.knowledge_chunks cascade;

-- pgvector je bio uveden samo zbog baze znanja. "restrict" namerno: ako je u
-- međuvremenu nešto drugo počelo da koristi vektore, ovo će pući umesto da
-- tiho obriše tuđu kolonu.
drop extension if exists vector restrict;

notify pgrst, 'reload schema';
