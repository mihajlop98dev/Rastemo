-- Pitanja za lekara: sopstveni unos umesto dva zakucana pitanja.
--
-- Nova tabela nije potrebna: diary_entries već ima tip 'doctor_question',
-- predviđen u prvoj verziji šeme a nikad iskorišćen. Politika pristupa
-- (diary_owner_all) već pokriva ove redove, pa se ne dira.
--
-- Dodaje se samo oznaka da je pitanje postavljeno, da se lista može
-- štiklirati tokom pregleda.

alter table public.diary_entries
  add column if not exists is_done boolean not null default false;

-- Pitanja se čitaju odvojeno od beleški, uvek filtrirana po tipu.
create index if not exists diary_entries_tip_idx
  on public.diary_entries (pregnancy_id, entry_type);
