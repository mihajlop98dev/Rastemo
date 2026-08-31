-- ---------------------------------------------------------------------------
-- Seed: porodilišta i ginekološko-akušerske ustanove u Srbiji
--
-- Nazivi, gradovi, adrese i telefoni prikupljeni iz javno objavljenih spiskova
-- porodilišta i unakrsno provereni na dva nezavisna izvora. Tamo gde su se
-- izvori razlikovali, grad je potvrđen preko sajta same ustanove:
--   * ZC Studenica  -> Kraljevo   (jedan izvor je grad naveo kao "Studenica")
--   * OB Sveti Luka -> Smederevo  (jedan izvor: "Svetozarevo", i pogrešan tip ustanove)
--   * OB Dr Laza K. Lazarević -> Šabac (jedan izvor: "Valjevo")
--   * ZC Dr Đorđe Joanović -> Zrenjanin (jedan izvor: "Đorđe Jovanović | Vranje")
-- KBC Zemun je dodat jer je nedostajao u prvom izvoru.
--
-- Ustanove sa Kosova i Metohije nisu uključene — nije bilo moguće pouzdano
-- proveriti aktuelne nazive i kontakte.
--
-- Ovo su ustanove, ne pojedinačni lekari. Lekare unose korisnice kroz app
-- ("Dodaj lekara"), a kolona doctors.is_verified služi za potvrdu unosa.
-- ---------------------------------------------------------------------------

delete from public.clinics where name in (
  'Klinika za ginekologiju i akušerstvo UKC Srbije (Višegradska)',
  'GAK Narodni front',
  'KBC Dr Dragiša Mišović',
  'KBC Zvezdara',
  'KBC Zemun',
  'Dom zdravlja Lazarevac',
  'Klinika za ginekologiju i akušerstvo KC Vojvodine',
  'Opšta bolnica GEA',
  'Zdravstveni centar Subotica',
  'Zdravstveni centar Dr Radivoj Simović',
  'Zdravstveni centar Sremska Mitrovica',
  'Zdravstveni centar Južni Banat',
  'Zdravstveni centar Dr Đorđe Joanović',
  'Zdravstveni centar Kosta Sredojev-Šljuka',
  'Zdravstveni centar Vršac',
  'Zdravstveni centar Dr Veljko Vlahović',
  'Zdravstveni centar Dr Gere Ištvan',
  'Dom zdravlja Dr Hadži Janoš',
  'Dom zdravlja Ruma',
  'Dom zdravlja Novi Kneževac',
  'Dom zdravlja Odžaci',
  'Univerzitetski klinički centar Kragujevac',
  'Univerzitetski klinički centar Niš',
  'Zdravstveni centar Studenica',
  'Opšta bolnica Sveti Luka',
  'Opšta bolnica Dr Laza K. Lazarević',
  'Zdravstveni centar Valjevo',
  'Zdravstveni centar Užice',
  'Zdravstveni centar Čačak',
  'Zdravstveni centar Kruševac',
  'Zdravstveni centar Jagodina',
  'Zdravstveni centar Ćuprija',
  'Zdravstveni centar Paraćin',
  'Opšta bolnica Stefan Visoki',
  'Opšta bolnica Požarevac',
  'Zdravstveni centar Petrovac na Mlavi',
  'Zdravstveni centar Zaječar',
  'Zdravstveni centar Bor',
  'Zdravstveni centar Negotin',
  'Zdravstveni centar Kladovo',
  'Zdravstveni centar Knjaževac',
  'Zdravstveni centar Dr Veroljub Cakić',
  'Zdravstveni centar Aleksinac',
  'Zdravstveni centar Aranđelovac',
  'Zdravstveni centar Gornji Milanovac',
  'Zdravstveni centar Dr Milenko Marin',
  'Dom zdravlja Ljubovija',
  'Zdravstveni centar Pirot',
  'Zdravstveni centar Toplica',
  'Zdravstveni centar Leskovac',
  'Zdravstveni centar Vranje',
  'Zdravstveni centar Surdulica',
  'Zdravstveni centar Novi Pazar',
  'Opšta bolnica Priboj',
  'Medicinski centar Prijepolje',
  'Dom zdravlja Tutin'
);

insert into public.clinics (name, city, address, phone) values ('Klinika za ginekologiju i akušerstvo UKC Srbije (Višegradska)', 'Beograd', 'Višegradska 26', '011/3615-611');
insert into public.clinics (name, city, address, phone) values ('GAK Narodni front', 'Beograd', 'Kraljice Natalije 62', '011/2068-242');
insert into public.clinics (name, city, address, phone) values ('KBC Dr Dragiša Mišović', 'Beograd', 'Heroja Milana Tepića 1', '011/3630-700');
insert into public.clinics (name, city, address, phone) values ('KBC Zvezdara', 'Beograd', 'Dimitrija Tucovića 161', '011/3806-969');
insert into public.clinics (name, city, address, phone) values ('KBC Zemun', 'Beograd', 'Vukova 9', null);
insert into public.clinics (name, city, address, phone) values ('Dom zdravlja Lazarevac', 'Lazarevac', 'Dr Đorđa Kovačevića 27', '011/8123-141');
insert into public.clinics (name, city, address, phone) values ('Klinika za ginekologiju i akušerstvo KC Vojvodine', 'Novi Sad', 'Branimira Ćosića 37', '021/4899-222');
insert into public.clinics (name, city, address, phone) values ('Opšta bolnica GEA', 'Novi Sad', 'Laze Lazarevića 28', '021/6540-130');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Subotica', 'Subotica', 'Izvorska 3', '024/555-222');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Dr Radivoj Simović', 'Sombor', 'Vojvođanska 75', '025/467-700');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Sremska Mitrovica', 'Sremska Mitrovica', 'Stari šor 65', '022/610-222');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Južni Banat', 'Pančevo', 'Miloša Trebinjca 11', '013/306-400');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Dr Đorđe Joanović', 'Zrenjanin', null, '023/513-200');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Kosta Sredojev-Šljuka', 'Kikinda', 'Đure Jakšića 110', '023/423-518');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Vršac', 'Vršac', 'Abraševićeva bb', '013/832-425');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Dr Veljko Vlahović', 'Vrbas', 'Palih boraca 20', '021/7954-593');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Dr Gere Ištvan', 'Senta', 'Zlatne grede 20', '024/815-111');
insert into public.clinics (name, city, address, phone) values ('Dom zdravlja Dr Hadži Janoš', 'Bačka Topola', 'Svetog Stefana 1', '024/715-425');
insert into public.clinics (name, city, address, phone) values ('Dom zdravlja Ruma', 'Ruma', 'Orlovićeva bb', '022/479-395');
insert into public.clinics (name, city, address, phone) values ('Dom zdravlja Novi Kneževac', 'Novi Kneževac', null, null);
insert into public.clinics (name, city, address, phone) values ('Dom zdravlja Odžaci', 'Odžaci', null, null);
insert into public.clinics (name, city, address, phone) values ('Univerzitetski klinički centar Kragujevac', 'Kragujevac', 'Zmaj Jovina 30', '034/505-050');
insert into public.clinics (name, city, address, phone) values ('Univerzitetski klinički centar Niš', 'Niš', 'Bulevar dr Zorana Đinđića 48', '018/4238-181');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Studenica', 'Kraljevo', 'Jug Bogdanova bb', '036/301-568');
insert into public.clinics (name, city, address, phone) values ('Opšta bolnica Sveti Luka', 'Smederevo', 'Knez Mihajlova 51', '026/223-522');
insert into public.clinics (name, city, address, phone) values ('Opšta bolnica Dr Laza K. Lazarević', 'Šabac', null, null);
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Valjevo', 'Valjevo', 'Obrena Nikolića 5', '014/295-295');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Užice', 'Užice', 'Miloša Obrenovića bb', '031/561-255');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Čačak', 'Čačak', 'Dr Dragiše Mišovića 25', '032/374-222');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Kruševac', 'Kruševac', 'Kosovska 16', '037/414-566');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Jagodina', 'Jagodina', 'Karađorđeva 4', '035/221-032');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Ćuprija', 'Ćuprija', 'Miodraga Novakovića bb', '035/470-775');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Paraćin', 'Paraćin', 'Majora Marka bb', '035/563-517');
insert into public.clinics (name, city, address, phone) values ('Opšta bolnica Stefan Visoki', 'Smederevska Palanka', 'Vuka Karadžića 147', '026/321-124');
insert into public.clinics (name, city, address, phone) values ('Opšta bolnica Požarevac', 'Požarevac', 'Bratstva Jedinstva 135', '012/550-222');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Petrovac na Mlavi', 'Petrovac na Mlavi', 'Moravska 2', '012/327-982');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Zaječar', 'Zaječar', 'Rasadnička bb', '019/425-811');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Bor', 'Bor', 'Dragiše Mišovića 1', '030/422-777');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Negotin', 'Negotin', 'Badnjevski put bb', '019/542-951');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Kladovo', 'Kladovo', '22. septembra bb', '019/801-455');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Knjaževac', 'Knjaževac', '4. jula 2', '019/731-526');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Dr Veroljub Cakić', 'Majdanpek', 'Kapetanska 30', '030/581-526');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Aleksinac', 'Aleksinac', 'Momčila Popovića 144', '018/804-211');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Aranđelovac', 'Aranđelovac', 'Kralja Petra I 62', '034/712-779');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Gornji Milanovac', 'Gornji Milanovac', 'Vojvode Milana Obrenovića 37', '032/711-670');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Dr Milenko Marin', 'Loznica', 'Vladislava Bronjevskog 65', '015/873-333');
insert into public.clinics (name, city, address, phone) values ('Dom zdravlja Ljubovija', 'Ljubovija', 'Vojvode Mišića 58', '015/661-826');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Pirot', 'Pirot', 'Vojvode Momčila bb', '010/305-214');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Toplica', 'Prokuplje', 'Pasjačka 2', '027/324-000');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Leskovac', 'Leskovac', 'Svetozara Markovića 116', '016/252-500');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Vranje', 'Vranje', 'Jovana Jankovića Lunge 1', '017/422-242');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Surdulica', 'Surdulica', 'Srpskih vladara 111', '017/815-182');
insert into public.clinics (name, city, address, phone) values ('Zdravstveni centar Novi Pazar', 'Novi Pazar', 'Generala Živkovića 1', '020/314-722');
insert into public.clinics (name, city, address, phone) values ('Opšta bolnica Priboj', 'Priboj', 'Pribojske čete bb', '033/55-680');
insert into public.clinics (name, city, address, phone) values ('Medicinski centar Prijepolje', 'Prijepolje', 'Rajka L. Divca bb', '033/714-162');
insert into public.clinics (name, city, address, phone) values ('Dom zdravlja Tutin', 'Tutin', 'Bogoljuba Čukića 12', '020/811-027');
