-- Koordinate porodilišta, za prikaz na mapi i za navigaciju.
--
-- Dobijene jednokratnim geokodiranjem preko Nominatim servisa (OpenStreetMap),
-- uz poštovanje njihovog ograničenja od jednog upita u sekundi. Podaci su
-- © OpenStreetMap contributors, ODbL — atribucija stoji na samoj mapi.
--
-- Svih 56 ustanova ima tačnu lokaciju. Tri od njih nisu imale adresu u bazi,
-- pa su nađene po nazivu bolnice i tu se adresa i dopunjuje.
--
-- Zašto koordinate a ne naziv u linku ka Google mapama: probano je i jedno i
-- drugo. Za Kikindu je Google na tekstualni upit vratio dom zdravlja umesto
-- bolnice, iako je adresa bila u upitu. Koordinate ne ostavljaju prostora
-- za pogrešnu ustanovu.

alter table public.clinics
  add column if not exists lat numeric(9,6),
  add column if not exists lng numeric(9,6),
  -- Ostaje za ustanove koje se kasnije dodaju bez tačne adrese.
  add column if not exists lokacija_priblizna boolean not null default false;

update public.clinics set address = 'Popa Karana 4' where name = 'Opšta bolnica Dr Laza K. Lazarević' and address is null;
update public.clinics set address = 'Dr Vase Savića 5' where name = 'Zdravstveni centar Dr Đorđe Joanović' and address is null;
update public.clinics set address = 'Karađorđeva 64' where name = 'Zdravstveni centar Dr Gere Ištvan' and address is null;

update public.clinics set lat = 44.798575, lng = 20.455189 where name = 'Klinika za ginekologiju i akušerstvo UKC Srbije (Višegradska)';
update public.clinics set lat = 44.809762, lng = 20.460117 where name = 'GAK Narodni front';
update public.clinics set lat = 44.779093, lng = 20.460530 where name = 'KBC Dr Dragiša Mišović';
update public.clinics set lat = 44.799562, lng = 20.502105 where name = 'KBC Zvezdara';
update public.clinics set lat = 44.841862, lng = 20.406806 where name = 'KBC Zemun';
update public.clinics set lat = 44.382184, lng = 20.274813 where name = 'Dom zdravlja Lazarevac';
update public.clinics set lat = 45.258667, lng = 19.830214 where name = 'Klinika za ginekologiju i akušerstvo KC Vojvodine';
update public.clinics set lat = 45.236171, lng = 19.823150 where name = 'Opšta bolnica GEA';
update public.clinics set lat = 46.081229, lng = 19.671518 where name = 'Zdravstveni centar Subotica';
update public.clinics set lat = 45.781375, lng = 19.104945 where name = 'Zdravstveni centar Dr Radivoj Simović';
update public.clinics set lat = 44.973117, lng = 19.602982 where name = 'Zdravstveni centar Sremska Mitrovica';
update public.clinics set lat = 44.869031, lng = 20.652823 where name = 'Zdravstveni centar Južni Banat';
update public.clinics set lat = 45.374034, lng = 20.378608 where name = 'Zdravstveni centar Dr Đorđe Joanović';
update public.clinics set lat = 45.833613, lng = 20.478295 where name = 'Zdravstveni centar Kosta Sredojev-Šljuka';
update public.clinics set lat = 45.120505, lng = 21.305763 where name = 'Zdravstveni centar Vršac';
update public.clinics set lat = 45.571350, lng = 19.638156 where name = 'Zdravstveni centar Dr Veljko Vlahović';
update public.clinics set lat = 45.916430, lng = 20.093497 where name = 'Zdravstveni centar Dr Gere Ištvan';
update public.clinics set lat = 45.822518, lng = 19.632730 where name = 'Dom zdravlja Dr Hadži Janoš';
update public.clinics set lat = 45.031538, lng = 19.815267 where name = 'Dom zdravlja Ruma';
update public.clinics set lat = 46.040837, lng = 20.101318 where name = 'Dom zdravlja Novi Kneževac';
update public.clinics set lat = 45.502164, lng = 19.256908 where name = 'Dom zdravlja Odžaci';
update public.clinics set lat = 44.019061, lng = 20.914639 where name = 'Univerzitetski klinički centar Kragujevac';
update public.clinics set lat = 43.314449, lng = 21.912528 where name = 'Univerzitetski klinički centar Niš';
update public.clinics set lat = 43.723120, lng = 20.696607 where name = 'Zdravstveni centar Studenica';
update public.clinics set lat = 44.660744, lng = 20.924666 where name = 'Opšta bolnica Sveti Luka';
update public.clinics set lat = 44.751009, lng = 19.693200 where name = 'Opšta bolnica Dr Laza K. Lazarević';
update public.clinics set lat = 44.276356, lng = 19.894171 where name = 'Zdravstveni centar Valjevo';
update public.clinics set lat = 43.849537, lng = 19.861912 where name = 'Zdravstveni centar Užice';
update public.clinics set lat = 43.889117, lng = 20.351989 where name = 'Zdravstveni centar Čačak';
update public.clinics set lat = 43.581464, lng = 21.320374 where name = 'Zdravstveni centar Kruševac';
update public.clinics set lat = 43.978875, lng = 21.255898 where name = 'Zdravstveni centar Jagodina';
update public.clinics set lat = 43.936595, lng = 21.373650 where name = 'Zdravstveni centar Ćuprija';
update public.clinics set lat = 43.864920, lng = 21.415052 where name = 'Zdravstveni centar Paraćin';
update public.clinics set lat = 44.364174, lng = 20.969086 where name = 'Opšta bolnica Stefan Visoki';
update public.clinics set lat = 44.632866, lng = 21.186382 where name = 'Opšta bolnica Požarevac';
update public.clinics set lat = 44.376189, lng = 21.415581 where name = 'Zdravstveni centar Petrovac na Mlavi';
update public.clinics set lat = 43.866797, lng = 22.291383 where name = 'Zdravstveni centar Zaječar';
update public.clinics set lat = 44.080036, lng = 22.091597 where name = 'Zdravstveni centar Bor';
update public.clinics set lat = 44.232711, lng = 22.528240 where name = 'Zdravstveni centar Negotin';
update public.clinics set lat = 44.609320, lng = 22.617772 where name = 'Zdravstveni centar Kladovo';
update public.clinics set lat = 43.564043, lng = 22.248910 where name = 'Zdravstveni centar Knjaževac';
update public.clinics set lat = 44.424376, lng = 21.940614 where name = 'Zdravstveni centar Dr Veroljub Cakić';
update public.clinics set lat = 43.539675, lng = 21.700517 where name = 'Zdravstveni centar Aleksinac';
update public.clinics set lat = 44.305021, lng = 20.562481 where name = 'Zdravstveni centar Aranđelovac';
update public.clinics set lat = 44.020327, lng = 20.457434 where name = 'Zdravstveni centar Gornji Milanovac';
update public.clinics set lat = 44.535606, lng = 19.225350 where name = 'Zdravstveni centar Dr Milenko Marin';
update public.clinics set lat = 44.188156, lng = 19.370510 where name = 'Dom zdravlja Ljubovija';
update public.clinics set lat = 43.158502, lng = 22.575082 where name = 'Zdravstveni centar Pirot';
update public.clinics set lat = 43.227158, lng = 21.591473 where name = 'Zdravstveni centar Toplica';
update public.clinics set lat = 42.993751, lng = 21.938522 where name = 'Zdravstveni centar Leskovac';
update public.clinics set lat = 42.551259, lng = 21.901874 where name = 'Zdravstveni centar Vranje';
update public.clinics set lat = 42.684324, lng = 22.168472 where name = 'Zdravstveni centar Surdulica';
update public.clinics set lat = 43.133772, lng = 20.511601 where name = 'Zdravstveni centar Novi Pazar';
update public.clinics set lat = 43.584457, lng = 19.518331 where name = 'Opšta bolnica Priboj';
update public.clinics set lat = 43.386858, lng = 19.666125 where name = 'Medicinski centar Prijepolje';
update public.clinics set lat = 42.989587, lng = 20.339810 where name = 'Dom zdravlja Tutin';

-- Provera: sve ustanove treba da imaju koordinate.
-- select name, city from public.clinics where lat is null;
