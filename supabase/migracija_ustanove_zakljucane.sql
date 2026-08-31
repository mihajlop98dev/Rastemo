-- ---------------------------------------------------------------------------
-- Ustanove: čišćenje spiska i zabrana korisničkog unosa
--
-- Do sada je svaka prijavljena korisnica mogla da doda ustanovu, a admin nije
-- imao nikakav pregled nad tim. Posledica se već videla: dva unosa za Bel Medic
-- sa različitim adresama, jedan dom zdravlja koji nije porodilište, i jedna
-- ordinacija bez ijednog podatka.
--
-- Pogrešna adresa porodilišta je skuplja greška od pogrešnog imena lekara —
-- žena u 38. nedelji ne treba da otkrije da je došla na pogrešno mesto. Zato
-- spisak ubuduće održava samo administrator.
-- ---------------------------------------------------------------------------

-- ---------- 1. brisanje onoga što nije porodilište ----------
-- „Dz Borca" je dom zdravlja, bez adrese i telefona; „Ordinacija Vita" nije
-- porodilište. Oba su ušla tokom testiranja. Veze se prvo raskidaju, da
-- brisanje ne bi tiho ostavilo lekara ili pregled bez ustanove.
update public.doctors set clinic_id = null
 where clinic_id in (select id from public.clinics where name in ('Dz Borca', 'Ordinacija Vita'));

update public.appointments set clinic_id = null
 where clinic_id in (select id from public.clinics where name in ('Dz Borca', 'Ordinacija Vita'));

delete from public.clinics where name in ('Dz Borca', 'Ordinacija Vita');

-- ---------- 2. dopuna postojećeg unosa ----------
-- Zvanični sajt porodilistegea.com, 19.08.2026.
update public.clinics
   set name    = 'Porodilište GEA (privatno porodilište)',
       address = 'Laze Lazarevića 28',
       phone   = '021/6540-130'
 where name = 'Opšta bolnica GEA';

-- ---------- 3. još jedno privatno porodilište ----------
-- Zvanični sajt bolnicaavala.rs, 19.08.2026.
insert into public.clinics (name, city, address, phone)
select 'Opšta bolnica Avala (privatno porodilište)', 'Beograd', 'Omladinskih brigada 86a', '011/7773-800'
 where not exists (select 1 from public.clinics where name like 'Opšta bolnica Avala%');

-- ---------- 4. zabrana korisničkog unosa ----------
-- Čitanje ostaje javno; menjati sme samo administrator.
drop policy if exists "clinics_authenticated_insert" on public.clinics;

drop policy if exists "clinics_admin_insert" on public.clinics;
create policy "clinics_admin_insert" on public.clinics
  for insert with check (public.is_admin());

drop policy if exists "clinics_admin_update" on public.clinics;
create policy "clinics_admin_update" on public.clinics
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "clinics_admin_delete" on public.clinics;
create policy "clinics_admin_delete" on public.clinics
  for delete using (public.is_admin());

notify pgrst, 'reload schema';
