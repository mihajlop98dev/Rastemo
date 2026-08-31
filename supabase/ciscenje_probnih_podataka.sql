-- Brisanje probne terapije koju sam uneo tokom provere istorije uzimanja.
--
-- Aplikacija terapiju samo deaktivira (active = false), da bi istorija ostala
-- čitljiva, pa se probni red mora ukloniti ovde. Logovi odlaze sa njim
-- (medication_logs ima on delete cascade).
--
-- Pitanje za lekara koje sam uneo obrisano je kroz samu aplikaciju.

delete from public.medications where name = 'PROBA Folna kiselina';

-- Provera: ne sme da vrati nijedan red.
-- select id, name, active from public.medications where name like 'PROBA%';
