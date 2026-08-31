-- ---------------------------------------------------------------------------
-- Sređivanje unosa za Bel Medic
--
-- Tokom testiranja su ušla dva unosa za istu ustanovu:
--   „Belmedik"  — Bulevar Oslobodjenja 155, Beograd
--   „BelMedic"  — Koste Jovanovica 87, bez grada
--
-- Šta je tačno (zvanični sajt acibadembelmedic.rs, 19.08.2026):
--   * ustanova se od preuzimanja zove Acibadem Bel Medic
--   * ima pet lokacija u Beogradu; porodilište je u opštoj bolnici na
--     Koste Jovanovića 87, dok je Bulevar oslobođenja 155 poliklinika
--   * kontakt: 011/3091-000
--
-- Zato se zadržava unos sa tačnom adresom i ispravlja, a drugi se briše.
-- Brisanje ide TEK pošto se lekari prebace na zadržani unos: clinic_id ima
-- "on delete set null", pa bi ih obrisana ustanova tiho ostavila bez nje.
-- ---------------------------------------------------------------------------

-- 1) ispravljamo unos koji ostaje
update public.clinics
   set name    = 'Acibadem Bel Medic (privatno porodilište)',
       city    = 'Beograd',
       address = 'Koste Jovanovića 87',
       phone   = '011/3091-000'
 where name = 'BelMedic';

-- 2) prebacujemo sve što je bilo vezano za dupli unos
update public.doctors d
   set clinic_id = (select id from public.clinics where name = 'Acibadem Bel Medic (privatno porodilište)')
 where d.clinic_id = (select id from public.clinics where name = 'Belmedik');

update public.appointments a
   set clinic_id = (select id from public.clinics where name = 'Acibadem Bel Medic (privatno porodilište)')
 where a.clinic_id = (select id from public.clinics where name = 'Belmedik');

-- 3) tek sada brišemo dupli
delete from public.clinics where name = 'Belmedik';

notify pgrst, 'reload schema';
