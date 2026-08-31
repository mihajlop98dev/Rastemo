-- ---------------------------------------------------------------------------
-- Privatna porodilišta u Beogradu
--
-- Dosadašnji spisak je obuhvatao samo državne ustanove. Ove dve se u praksi
-- najčešće pominju kao privatna porodilišta, pa je izostavljanje bilo rupa.
--
-- Podaci uzeti sa zvaničnih sajtova ustanova, 19.08.2026:
--   MediGroup — medigroup.rs/lokacije/bolnice/opsta-bolnica-medigroup-novi-beograd/
--   Euromedik — euromedic.rs/lokacije/euromedik-bolnica-4-dragoslava-srejovica-2a/
--
-- Napomena o Euromediku: ustanova ima tri lokacije u Beogradu, ali se porođaji
-- obavljaju u Bolnici 4 na Dragoslava Srejovića. Zato ovde ide baš ta adresa, a
-- ne Bulevar umetnosti ili Višegradska, gde porodilišta nema.
--
-- Ponovno pokretanje je bezbedno — unos ide po nazivu.
-- ---------------------------------------------------------------------------

insert into public.clinics (name, city, address, phone)
select v.name, v.city, v.address, v.phone
  from (values
    ('Opšta bolnica MediGroup (privatno porodilište)', 'Beograd', 'Milutina Milankovića 3', '011/4040-100'),
    ('Euromedik Bolnica 4 (privatno porodilište)',     'Beograd', 'Dragoslava Srejovića 2a', '011/7158-740')
  ) as v(name, city, address, phone)
 where not exists (
   select 1 from public.clinics c where c.name = v.name
 );

notify pgrst, 'reload schema';
