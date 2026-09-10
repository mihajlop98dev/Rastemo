-- Zvanične teme na forumu.
--
-- Problem: dvanaest kategorija, dve teme, nula odgovora. Niko ne piše u
-- prazan forum, a forum se ne puni sam — to je klasičan zastoj na početku.
--
-- Rešenje NIJE izmišljena korisnica. Žene ovde biraju porodilište i čitaju
-- tuđa iskustva kao istinita; izmišljeno iskustvo bi bilo laž na mestu gde se
-- donose stvarne odluke, a i ceo sajt stoji na tome da je tačan.
--
-- Umesto toga, sajt postavlja **pitanja** pod svojim imenom, jasno označeno.
-- To nije laž nego poziv na razgovor: kategorije prestaju da budu prazne,
-- prva korisnica ima gde da odgovori, a niko nije obmanut.

alter table public.forum_topics
  add column if not exists zvanicna boolean not null default false;

-- Pogled: zvanična tema se potpisuje sajtom, a id autora se ne izdaje —
-- nema smisla slati poruku sajtu, a ni otkrivati čiji je nalog upisao temu.
create or replace view public.forum_teme_v as
select t.id,
       t.category_id,
       t.title,
       t.body,
       t.is_anonymous,
       t.is_pinned,
       t.reply_count,
       t.created_at,
       case when t.is_anonymous or t.zvanicna then null else t.author_id end as author_id,
       case
         when t.zvanicna then 'Dnevnik trudnoće'
         when t.is_anonymous then null
         else coalesce(
           nullif(btrim(p.username), ''),
           nullif(split_part(btrim(p.full_name), ' ', 1), ''),
           'Korisnica'
         )
       end as autor,
       t.author_id = auth.uid() as moja,
       t.uklonjeno_u,
       -- Nove kolone idu na kraj: `create or replace view` ne dozvoljava da se
       -- postojeće pomere sa svojih mesta.
       t.zvanicna
  from public.forum_topics t
  join public.profiles p on p.id = t.author_id;

grant select on public.forum_teme_v to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Pitanja po kategorijama
-- ---------------------------------------------------------------------------
-- Sve su pitanja, nijedno nije tvrdnja o nečijem iskustvu. `on conflict` nema
-- jer naslov nije jedinstven — zato provera ispod sprečava dvostruko upisivanje
-- ako se skripta pokrene dvaput.

insert into public.forum_topics (category_id, author_id, title, body, zvanicna, is_anonymous)
select k.id,
       (select id from public.profiles where role = 'admin' order by created_at limit 1),
       p.naslov,
       p.telo,
       true,
       false
from (values
  ('Prvi trimestar', 'Koji simptom vas je najviše iznenadio na početku?',
   'Mnoge očekuju mučninu, pa ih onda zatekne nešto sasvim deseto — umor od kog se ne može ustati, čudan ukus u ustima, osetljivost na mirise. Šta je vama bilo najneočekivanije u prvih dvanaest nedelja?'),
  ('Prvi trimestar', 'Kada ste rekli porodici i prijateljima?',
   'Neke sačekaju prvi ultrazvuk, neke dvanaestu nedelju, a neke kažu odmah jer ne umeju da ćute. Kada ste vi rekli, i da li biste sada uradile isto?'),
  ('Drugi trimestar', 'Kada ste prvi put osetile bebu?',
   'U knjigama piše između 16. i 22. nedelje, ali svaka priča je drugačija — neke opisuju leptiriće, neke mehuriće, neke ništa dugo pa odjednom udarac. Kada je bilo kod vas i na šta je ličilo?'),
  ('Treci trimestar', 'Kako spavate u poslednjim nedeljama?',
   'Poslednji mesec obično donese neispavane noći: ne može se na stomak, na leđima nije preporučljivo, a jastuka nikad dosta. Šta je vama pomoglo da nađete položaj?'),
  ('Ishrana', 'Šta vam se gadilo, a šta ste mogle da jedete?',
   'Kod nekih trudnica se ukusi potpuno preokrenu — omiljeno jelo odjednom ne može da se pogleda, a nešto što nikad niste voleli postane jedino što prolazi. Kako je bilo kod vas?'),
  ('Simptomi', 'Šta je stvarno pomoglo protiv mučnine?',
   'Saveta ima na sve strane — đumbir, slani krekeri, jesti pre ustajanja, jesti češće a manje. Zanima nas šta je od toga vama zaista pomoglo, a šta se pokazalo kao prazna priča.'),
  ('Analize i pregledi', 'Kako ste birale ginekologa?',
   'Po preporuci, po blizini, po tome ko radi u porodilištu u kom želite da rodite? I da li ste menjale lekara tokom trudnoće — i zašto?'),
  ('Pitanja za lekara', 'Šta biste pitale da možete ponovo na prvi pregled?',
   'Na prvom pregledu se obično sve zaboravi od uzbuđenja, pa se pitanja sete tek u kolima. Šta biste danas pitale, a tada niste?'),
  ('Priprema', 'Šta ste spakovale u torbu za porodilište, a nije vam trebalo?',
   'Spiskovi na internetu su podugački, a iskustva kažu da pola toga ostane nedirnuto. Šta je vama bilo suvišno, a šta biste dodale na svaki spisak?'),
  ('Oprema', 'Koja kupovina se najviše isplatila, a koja najmanje?',
   'Oprema za bebe ume da košta kao mali automobil, a neke stvari se koriste dva puta. Šta bi vama bilo pametno da kupite ponovo, a šta biste preskočile?'),
  ('Iskustva', 'Kako ste birale porodilište?',
   'Po lekaru, po gradu, po preporuci ili po tome gde je bilo mesta? Zanima nas šta je presudilo i da li ste zadovoljne izborom.'),
  ('Iskustva', 'Šta biste rekle sebi na početku trudnoće?',
   'Kad se sve završi, obično ostane par rečenica koje bi čovek voleo da je čuo na vreme. Šta biste rekle sebi od pre devet meseci?'),
  ('Partner', 'Kako je partner primio vest i kako se snašao?',
   'Neki odmah krenu da čitaju i pakuju, neki se izgube pa se snađu kasnije. Kako je bilo kod vas i šta je najviše pomoglo?'),
  ('Nakon porodjaja', 'Šta vas je najviše iznenadilo u prvim nedeljama sa bebom?',
   'O trudnoći se priča mnogo, o prvim nedeljama kod kuće mnogo manje. Šta je bilo drugačije nego što ste očekivale?')
) as p(kategorija, naslov, telo)
join public.forum_categories k on k.name = p.kategorija
where not exists (
  select 1 from public.forum_topics t where t.title = p.naslov
);

notify pgrst, 'reload schema';

-- Provera:
-- select k.name, t.title from public.forum_topics t
-- join public.forum_categories k on k.id = t.category_id
-- where t.zvanicna order by k.name;
