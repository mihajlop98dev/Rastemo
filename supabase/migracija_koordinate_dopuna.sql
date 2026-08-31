-- Dopuna: koordinate privatnih porodilista, plus adrese i telefoni koji su
-- nedostajali.
--
-- Prethodna migracija je pravljena iz seed fajlova, pa pet privatnih ustanova
-- u njoj nije ni bilo — u bazu su usle kasnije, kroz zasebne seed-ove i rucnu
-- ispravku Bel Medica. „Opsta bolnica GEA" je u bazi preimenovana u
-- „Porodiliste GEA (privatno porodiliste)", zbog cega je onaj update promasio
-- red i ustanova je ostala bez koordinata.
--
-- Cetiri ustanove su bile bez adrese ili telefona. Podaci su uzeti sa sajtova
-- samih ustanova; izvor stoji uz svaki red. Posle ove migracije nijedna
-- ustanova nema prazno polje.

update public.clinics set lat = 44.777475, lng = 20.472292 where name = 'Acibadem Bel Medic (privatno porodilište)';
update public.clinics set lat = 44.816411, lng = 20.487539 where name = 'Euromedik Bolnica 4 (privatno porodilište)';
update public.clinics set lat = 44.811867, lng = 20.401175 where name = 'Opšta bolnica Avala (privatno porodilište)';
update public.clinics set lat = 44.807108, lng = 20.421122 where name = 'Opšta bolnica MediGroup (privatno porodilište)';
update public.clinics set lat = 45.236171, lng = 19.823150 where name = 'Porodilište GEA (privatno porodilište)';

-- izvor: kbczemun.bg.ac.rs — adresa je vec bila tacna, nedostajao je telefon
update public.clinics set phone = '011/3772-666' where name = 'KBC Zemun';
-- izvor: dznk.org.rs
update public.clinics set address = 'Kralja Petra I Karađorđevića 85', phone = '0230/81-152', lat = 46.040837, lng = 20.101318 where name = 'Dom zdravlja Novi Kneževac';
-- izvor: dzodzaci.org.rs (telefon iz javnog imenika, sajt ga drzi u PDF-u)
update public.clinics set address = 'Mostonga 25', phone = '025/5742-131', lat = 45.502164, lng = 19.256907 where name = 'Dom zdravlja Odžaci';
-- izvor: bolnica015.org.rs
update public.clinics set address = 'Popa Karana 4', phone = '015/363-300', lat = 44.751009, lng = 19.693200 where name = 'Opšta bolnica Dr Laza K. Lazarević';

-- Sve ustanove sada imaju tacnu lokaciju nadjenu po adresi ili po nazivu
-- bolnice, pa nijedna vise nije samo centar grada. Kolona ostaje u tabeli
-- za ustanove koje se kasnije dodaju bez adrese.
update public.clinics set lokacija_priblizna = false where lokacija_priblizna = true;

-- Provera: nijedan od ova tri upita ne sme da vrati red.
-- select name from public.clinics where lat is null;
-- select name from public.clinics where address is null;
-- select name from public.clinics where phone is null;
