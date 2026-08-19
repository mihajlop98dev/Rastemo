/**
 * Tekst javnog vodiča, po nedelji trudnoće.
 *
 * Postojeći opisi u aplikaciji vezani su za trimestar — isti tekst za trinaest
 * nedelja. To je dovoljno unutar aplikacije, gde korisnica ionako vidi svoje
 * podatke, ali kao javne stranice bi značilo četrdeset gotovo istih strana.
 * Pretraživači to prepoznaju kao prazan sadržaj i ne prikazuju ga.
 *
 * Zato svaka nedelja ovde ima svoj tekst. Sve su opšte, edukativne tvrdnje —
 * bez dijagnoza, doza i preporuka terapije.
 */
export interface NedeljaVodic {
  nedelja: number;
  /** Naslov stranice; ulazi i u <title> i u Google rezultat. */
  naslov: string;
  /** Dve-tri rečenice ispod naslova. */
  uvod: string;
  /** Šta se te nedelje dešava sa bebom. */
  beba: string;
  /** Šta majka te nedelje najčešće oseća. */
  ti: string;
  /** Jedan konkretan, bezopasan savet. */
  savet: string;
}

export const VODIC: NedeljaVodic[] = [
  { nedelja: 4, naslov: '4. nedelja trudnoće',
    uvod: 'Test je pozitivan, a trudnoća se tek ugnezdila. Većina žena još ništa ne oseća.',
    beba: 'Oplođena jajna ćelija se ugnezdila u sluznicu materice i počinje da se deli u slojeve od kojih će nastati svi organi. Formira se i posteljica, koja će je hraniti narednih osam meseci.',
    ti: 'Izostanak menstruacije je često jedini znak. Neke žene osete blago zatezanje u donjem stomaku ili osetljivost grudi, druge baš ništa — i jedno i drugo je uobičajeno.',
    savet: 'Ako već ne piješ folnu kiselinu, sada je pravi trenutak da se posavetuješ sa lekarom o njoj. Najviše koristi ima baš u ovim prvim nedeljama.' },

  { nedelja: 5, naslov: '5. nedelja trudnoće',
    uvod: 'Počinje da kuca srce, iako je beba još manja od zrna susama.',
    beba: 'Formira se neuralna cev, od koje nastaju mozak i kičmena moždina. Srce počinje da se oblikuje i pravi prve otkucaje, još nepravilne.',
    ti: 'Umor ume da bude iznenađujuće jak. Mogu se javiti mučnina i pojačana osetljivost na mirise, jer nivo hormona naglo raste.',
    savet: 'Ne bori se sa umorom — telo troši ogromno energije na nešto što se još ne vidi. Lezi ranije bez griže savesti.' },

  { nedelja: 6, naslov: '6. nedelja trudnoće',
    uvod: 'Otkucaji srca se prvi put mogu videti na ultrazvuku.',
    beba: 'Srce kuca oko 110 puta u minuti. Naziru se zameci ruku i nogu, a lice počinje da se oblikuje — vidljive su tamne tačke na mestu očiju.',
    ti: 'Jutarnja mučnina obično dostiže pun zamah, i uprkos imenu ume da traje ceo dan. Česta potreba za mokrenjem je takođe uobičajena.',
    savet: 'Protiv mučnine često pomažu manji i češći obroci. Prazan stomak je obično pogoršava.' },

  { nedelja: 7, naslov: '7. nedelja trudnoće',
    uvod: 'Beba je udvostručila veličinu u odnosu na prošlu nedelju.',
    beba: 'Mozak se razvija najbrže od svih organa. Formiraju se nozdrve, a ruke i noge dobijaju oblik vesla. Bubrezi počinju da rade.',
    ti: 'Grudi su osetljive i punije. Raspoloženje ume naglo da se menja — to je hormonsko i proći će.',
    savet: 'Ako još nisi zakazala prvi pregled, uradi to sada. Prvi ultrazvuk se obično radi između 6. i 9. nedelje.' },

  { nedelja: 8, naslov: '8. nedelja trudnoće',
    uvod: 'Beba prvi put dobija merljivu težinu i počinje da se pomera.',
    beba: 'Prsti na rukama i nogama se razdvajaju, a rep koji je postojao nestaje. Beba se spontano pomera, ali je premala da bi se to osetilo.',
    ti: 'Struk počinje da se zaobljava, iako stomak još nije vidljiv. Mnoge žene primete da im je odeća oko pojasa tesnija.',
    savet: 'Vodi računa o unosu tečnosti. Voda pomaže i kod umora i kod zatvora, koji je u trudnoći čest.' },

  { nedelja: 9, naslov: '9. nedelja trudnoće',
    uvod: 'Kraj embrionalnog perioda — od sledeće nedelje beba se zove fetus.',
    beba: 'Svi osnovni organi su postavljeni i sada će rasti i sazrevati. Formiraju se mišići, pa pokreti postaju svrsishodniji.',
    ti: 'Mučnina je kod većine još izražena. Moguća je i pojačana salivacija i averzija prema hrani koju si ranije volela.',
    savet: 'Zapiši šta ti pogoršava mučninu — kod većine žena postoji obrazac, i kad se prepozna, lakše se izbegava.' },

  { nedelja: 10, naslov: '10. nedelja trudnoće',
    uvod: 'Najosetljiviji period razvoja je iza tebe.',
    beba: 'Vitalni organi počinju da funkcionišu. Formiraju se nokti i zameci zuba, a kosti postepeno otvrdnjavaju.',
    ti: 'Materica je sada veličine grejpfruta. Vene na grudima mogu postati vidljivije zbog povećanog protoka krvi.',
    savet: 'Oko ove nedelje se obično radi prvi veći skrining. Pitaj lekara šta je predviđeno u tvom slučaju.' },

  { nedelja: 11, naslov: '11. nedelja trudnoće',
    uvod: 'Beba počinje naglo da raste — u naredne tri nedelje udvostručiće dužinu.',
    beba: 'Glava je i dalje velika u odnosu na telo, ali se razmera polako menja. Beba otvara i zatvara šake i može da štuca.',
    ti: 'Mučnina kod nekih žena počinje da popušta. Kosa i nokti često izgledaju bolje nego inače, zahvaljujući hormonima.',
    savet: 'Između 11. i 14. nedelje radi se merenje nuhalnog nabora. Proveri sa lekarom kada da ga zakažeš.' },

  { nedelja: 12, naslov: '12. nedelja trudnoće',
    uvod: 'Kraj prvog trimestra — rizik od komplikacija značajno opada.',
    beba: 'Refleksi se razvijaju: beba će odgovoriti pokretom ako se pritisne stomak, mada to još ne osećaš. Crevа se premeštaju u trbušnu duplju.',
    ti: 'Umor i mučnina kod mnogih popuštaju. Materica se izdiže iz karlice, pa stomak počinje da se nazire.',
    savet: 'Mnoge žene tek sada saopštavaju vest okolini. Nema pravila — reci kad ti bude prijatno.' },

  { nedelja: 13, naslov: '13. nedelja trudnoće',
    uvod: 'Počinje drugi trimestar, koji većina žena pamti kao najlakši.',
    beba: 'Formiraju se glasne žice. Beba guta plodovu vodu i time vežba varenje. Otisci prstiju su već jedinstveni.',
    ti: 'Energija se često vraća. Apetit raste, a mučnina kod većine prestaje.',
    savet: 'Sada je dobar trenutak za blagu fizičku aktivnost — šetnju ili plivanje, uz saglasnost lekara.' },

  { nedelja: 14, naslov: '14. nedelja trudnoće',
    uvod: 'Beba pravi izraze lica, iako još nema kontrolu nad njima.',
    beba: 'Mišići lica su razvijeni dovoljno da se beba mršti i žmirka. Telo se prekriva finim maljama koje čuvaju toplotu.',
    ti: 'Stomak je sve vidljiviji. Neke žene primete tamnu liniju po sredini trbuha — to je uobičajeno i nestaje posle porođaja.',
    savet: 'Vreme je za udobniju odeću. Tesan pojas ume da pojača gorušicu koja tek dolazi.' },

  { nedelja: 15, naslov: '15. nedelja trudnoće',
    uvod: 'Beba počinje da reaguje na svetlost, iako su oči još zatvorene.',
    beba: 'Kosti postaju gušće i vidljive na ultrazvuku. Beba pomera zglobove i udove sve češće.',
    ti: 'Zapušen nos i krvarenje iz nosa su česti — sluznice otiču zbog pojačanog protoka krvi.',
    savet: 'Ako ti smeta suvoća nosa, pomaže vlaženje vazduha u spavaćoj sobi.' },

  { nedelja: 16, naslov: '16. nedelja trudnoće',
    uvod: 'Neke žene ove nedelje prvi put osete pokrete.',
    beba: 'Beba drži glavu uspravnije, a mišići vrata su jači. Počinje da čuje prigušene zvuke iz okoline.',
    ti: 'Prvi pokreti se osećaju kao leptirići ili mehurići. Kod prve trudnoće obično dolaze nešto kasnije, oko 18–20. nedelje.',
    savet: 'Ne brini ako još ništa ne osećaš — vreme prvih pokreta se jako razlikuje od žene do žene.' },

  { nedelja: 17, naslov: '17. nedelja trudnoće',
    uvod: 'Beba počinje da taloži masne naslage.',
    beba: 'Stvara se potkožno masno tkivo koje će održavati telesnu temperaturu. Pupčana vrpca je sve deblja i jača.',
    ti: 'Mogu se javiti bolovi sa strane stomaka — ligamenti koji drže matericu se istežu.',
    savet: 'Spavaj na boku, po mogućstvu levom. Tako je protok krvi ka bebi najbolji.' },

  { nedelja: 18, naslov: '18. nedelja trudnoće',
    uvod: 'Vreme za veliki ultrazvuk na kom se često vidi i pol.',
    beba: 'Sluh je dovoljno razvijen da beba čuje tvoj glas i otkucaje tvog srca. Formira se zaštitni sloj oko nerava.',
    ti: 'Apetit je često pojačan. Mogu se javiti vrtoglavice pri naglom ustajanju, zbog promena u krvnom pritisku.',
    savet: 'Ustaj polako iz ležećeg položaja. Vrtoglavica u trudnoći je uobičajena, ali pad nije bezazlen.' },

  { nedelja: 19, naslov: '19. nedelja trudnoće',
    uvod: 'Beba razvija čula dodira, ukusa i mirisa.',
    beba: 'Mozak izdvaja posebne zone za svako čulo. Kožu prekriva beličasti sloj koji je štiti od plodove vode.',
    ti: 'Bol u leđima postaje češći kako se težište pomera napred. Grčevi u nogama znaju da bude noću.',
    savet: 'Kod grčeva u listovima pomaže istezanje pre spavanja i dovoljno tečnosti tokom dana.' },

  { nedelja: 20, naslov: '20. nedelja trudnoće',
    uvod: 'Polovina trudnoće je iza tebe.',
    beba: 'Beba redovno spava i budi se, i ima svoj ritam. Ako je devojčica, u njenim jajnicima su već formirane sve jajne ćelije koje će ikada imati.',
    ti: 'Pokreti su sada jasniji i češći. Materica je u nivou pupka.',
    savet: 'Počni da pratiš kada je beba najaktivnija — taj ritam će ti kasnije biti koristan orijentir.' },

  { nedelja: 21, naslov: '21. nedelja trudnoće',
    uvod: 'Beba guta plodovu vodu i tako upoznaje ukuse.',
    beba: 'Sistem za varenje se uvežbava. Ukus hrane koju jedeš prelazi u plodovu vodu, pa beba već sada upoznaje porodične ukuse.',
    ti: 'Moguće su otekline stopala i gležnjeva, naročito uveče i po toplom vremenu.',
    savet: 'Podigni noge kad god možeš. Duže stajanje pogoršava otekline.' },

  { nedelja: 22, naslov: '22. nedelja trudnoće',
    uvod: 'Beba počinje da liči na novorođenče, samo je mnogo manja.',
    beba: 'Usne, kapci i obrve su jasno oblikovani. Beba hvata pupčanu vrpcu i istražuje sopstveno telo.',
    ti: 'Koža na stomaku se zateže i može da svrbi. Neke žene primete prve strije.',
    savet: 'Redovno hidriranje kože ublažava svrab. Strije zavise i od nasleđa, pa ne krivi sebe ako se pojave.' },

  { nedelja: 23, naslov: '23. nedelja trudnoće',
    uvod: 'Beba prvi put reaguje na zvuke spolja.',
    beba: 'Glasan zvuk može da je trgne. Pluća stvaraju supstancu koja će im omogućiti da se posle rođenja rašire.',
    ti: 'Mogu se javiti blage, neredovne kontrakcije koje ne bole — telo vežba za porođaj.',
    savet: 'Ako su kontrakcije bolne, redovne ili učestale, ne čekaj — javi se lekaru.' },

  { nedelja: 24, naslov: '24. nedelja trudnoće',
    uvod: 'Granica od koje beba ima realne šanse za preživljavanje van materice.',
    beba: 'Pluća se ubrzano razvijaju. Koža je još naborana jer masno tkivo tek počinje da je popunjava.',
    ti: 'Oko ove nedelje se obično radi test na gestacijski dijabetes.',
    savet: 'Ne preskači zakazane preglede u ovom periodu — nekoliko stanja se otkriva baš sada.' },

  { nedelja: 25, naslov: '25. nedelja trudnoće',
    uvod: 'Beba počinje da razlikuje tvoj glas od ostalih.',
    beba: 'Nervni sistem je dovoljno razvijen da prepoznaje poznate zvuke. Kosa dobija boju i strukturu.',
    ti: 'Gorušica je česta jer materica pritiska želudac. Nesanica se javlja kod mnogih.',
    savet: 'Poslednji obrok pojedi bar dva sata pre spavanja i ne ležite odmah posle jela.' },

  { nedelja: 26, naslov: '26. nedelja trudnoće',
    uvod: 'Beba prvi put otvara oči.',
    beba: 'Kapci se razdvajaju i beba trepće. Moždani talasi pokazuju odgovor na zvuk i dodir.',
    ti: 'Pokreti su snažni i vidljivi spolja. Bol u donjem delu leđa je čest.',
    savet: 'Partner sada može da oseti šutkanje ako stavi ruku na stomak — probajte uveče, kad je beba najaktivnija.' },

  { nedelja: 27, naslov: '27. nedelja trudnoće',
    uvod: 'Poslednja nedelja drugog trimestra.',
    beba: 'Beba ima pravilne cikluse spavanja i budnosti. Štucanje je često i osećaš ga kao ritmično trzanje.',
    ti: 'Zamor se vraća. Noge otiču više nego ranije, a san je isprekidan.',
    savet: 'Vreme je da razmisliš o kursu za trudnice — mesta se popunjavaju unapred.' },

  { nedelja: 28, naslov: '28. nedelja trudnoće',
    uvod: 'Počinje treći trimestar i češći pregledi.',
    beba: 'Beba sanja — mozak pokazuje faze sna sa brzim pokretima očiju. Masno tkivo se brzo nakuplja.',
    ti: 'Pregledi postaju češći. Ako imaš negativnu krvnu grupu, oko ove nedelje se obično daje odgovarajuća zaštita.',
    savet: 'Počni da brojiš pokrete jednom dnevno. Nagla promena u učestalosti je razlog da se javiš lekaru.' },

  { nedelja: 29, naslov: '29. nedelja trudnoće',
    uvod: 'Bebi sada trebaju najviše kalcijum, gvožđe i proteini.',
    beba: 'Kosti otvrdnjavaju i upijaju velike količine kalcijuma. Mišići i pluća nastavljaju da sazrevaju.',
    ti: 'Otežano disanje je često jer materica pritiska dijafragmu. Mogu se javiti hemoroidi.',
    savet: 'Jedi hranu bogatu vlaknima — zatvor u ovom periodu pogoršava skoro sve ostale tegobe.' },

  { nedelja: 30, naslov: '30. nedelja trudnoće',
    uvod: 'Beba zauzima sve više prostora, pa pokreti postaju drugačiji.',
    beba: 'Umesto naglih udaraca, sve češće osećaš prevrtanje i pritisak. Koštana srž preuzima proizvodnju crvenih krvnih zrnaca.',
    ti: 'San je sve teži. Česta potreba za mokrenjem se vraća jer beba pritiska bešiku.',
    savet: 'Jastuk između kolena ume da napravi veliku razliku u kvalitetu sna.' },

  { nedelja: 31, naslov: '31. nedelja trudnoće',
    uvod: 'Beba dobija oko 200 grama nedeljno.',
    beba: 'Svi organi su razvijeni osim pluća, koja i dalje sazrevaju. Beba okreće glavu i prati izvor svetlosti.',
    ti: 'Iz grudi može da počne da curi kolostrum — prvo mleko. To je normalno i ne znači da porođaj dolazi.',
    savet: 'Ako curenje smeta, uložci za dojenje rešavaju problem.' },

  { nedelja: 32, naslov: '32. nedelja trudnoće',
    uvod: 'Većina beba se do sada okrenula glavom nadole.',
    beba: 'Nokti su izrasli do vrhova prstiju. Beba vežba disanje, udišući i izdišući plodovu vodu.',
    ti: 'Lažne kontrakcije su češće. Kretanje je otežano, a umor izražen.',
    savet: 'Vreme je da spakuješ torbu za porodilište. Bolje prerano nego u žurbi.' },

  { nedelja: 33, naslov: '33. nedelja trudnoće',
    uvod: 'Imuni sistem bebe počinje da radi samostalno.',
    beba: 'Preko posteljice dobija antitela koja će je štititi prvih meseci. Kosti lobanje su još meke i pomerljive, da bi prošla kroz porođajni kanal.',
    ti: 'Pritisak u karlici raste. Otekline su izraženije nego ranije.',
    savet: 'Nagla i jaka oteklina lica ili šaka, uz glavobolju, nije obična oteklina — odmah se javi lekaru.' },

  { nedelja: 34, naslov: '34. nedelja trudnoće',
    uvod: 'Beba bi, ako bi se sada rodila, najverovatnije bila potpuno zdrava.',
    beba: 'Pluća su skoro zrela. Beba se okreće ka svetlosti i reaguje na muziku.',
    ti: 'Vid ume da bude blago zamućen zbog zadržavanja tečnosti. Umor je stalan.',
    savet: 'Dogovori sa partnerom ili porodicom kako ćeš stići do porodilišta — u svakom dobu dana.' },

  { nedelja: 35, naslov: '35. nedelja trudnoće',
    uvod: 'Ostalo je malo prostora, pa beba više ne može da se prevrne.',
    beba: 'Bubrezi su potpuno razvijeni, a jetra počinje da radi. Nakupljanje masti se nastavlja.',
    ti: 'Disanje je otežano dok se beba ne spusti niže. Nesanica je česta.',
    savet: 'Ako imaš plan porođaja, sada je vreme da ga proslediš lekaru i porodilištu.' },

  { nedelja: 36, naslov: '36. nedelja trudnoće',
    uvod: 'Od sledeće nedelje trudnoća se smatra donesenom.',
    beba: 'Beba se obično spušta u karlicu. Malje sa tela uglavnom nestaju.',
    ti: 'Disanje postaje lakše kad se beba spusti, ali pritisak na bešiku raste.',
    savet: 'Od ove nedelje pregledi su obično nedeljni. Nosi dokumentaciju sa sobom kad izlaziš.' },

  { nedelja: 37, naslov: '37. nedelja trudnoće',
    uvod: 'Trudnoća se sada smatra donesenom — beba je spremna.',
    beba: 'Beba vežba disanje, sisanje i treptanje. Nastavlja da dobija oko 30 grama dnevno.',
    ti: 'Mogu se javiti pravi znaci pripreme: gubitak sluzavog čepa, jače kontrakcije, pritisak u karlici.',
    savet: 'Zapamti razliku: lažne kontrakcije prolaze sa promenom položaja, prave postaju sve češće i jače.' },

  { nedelja: 38, naslov: '38. nedelja trudnoće',
    uvod: 'Porođaj može početi svakog dana.',
    beba: 'Beba je potpuno razvijena i samo dobija na težini. Grudi mogu izgledati blago otečeno zbog tvojih hormona — to prolazi.',
    ti: 'Nestrpljenje je često jače od tegoba. Spavanje je isprekidano.',
    savet: 'Odmaraj koliko možeš. Porođaj traži snagu, a nju sada skupljaš.' },

  { nedelja: 39, naslov: '39. nedelja trudnoće',
    uvod: 'Sve je spremno — čeka se početak.',
    beba: 'Pluća i dalje sazrevaju do samog kraja. Beba je zauzela položaj za porođaj.',
    ti: 'Kontrakcije postaju redovnije. Curenje plodove vode može biti mlaz ili slabo kapanje.',
    savet: 'Kod curenja plodove vode, krvarenja ili izostanka pokreta — ne čekaj, idi u porodilište.' },

  { nedelja: 40, naslov: '40. nedelja trudnoće',
    uvod: 'Termin je stigao, ali samo mali broj beba se rodi baš danas.',
    beba: 'Beba je potpuno spremna. Kosti lobanje će se preklopiti pri prolasku kroz porođajni kanal i vratiti u položaj posle rođenja.',
    ti: 'Čekanje ume da bude teže od svega pre njega. Kontrakcije mogu početi svakog trenutka.',
    savet: 'Oko 5 odsto beba rodi se na sam termin. Kašnjenje od nekoliko dana je uobičajeno.' },

  { nedelja: 41, naslov: '41. nedelja trudnoće',
    uvod: 'Prekoračenje termina je češće nego što se misli.',
    beba: 'Beba nastavlja da raste. Prati se količina plodove vode i rad srca.',
    ti: 'Pregledi su češći, a lekar prati da li je sve u redu sa posteljicom i plodovom vodom.',
    savet: 'Pitaj lekara do kada čeka i šta predlaže dalje. Plan za ovaj period treba da bude jasan.' },

  { nedelja: 42, naslov: '42. nedelja trudnoće',
    uvod: 'Posle ove nedelje se porođaj obično indukuje.',
    beba: 'Beba je zrela, a nadzor je pojačan. Prati se svaki znak da joj je potrebno da izađe.',
    ti: 'Kontrole su vrlo česte. Lekar predlaže vreme i način izazivanja porođaja.',
    savet: 'Sve odluke u ovom periodu donosi lekar na osnovu nalaza. Tvoj zadatak je da budeš dostupna i odmorna.' },
];

export function vodicZaNedelju(n: number): NedeljaVodic | undefined {
  return VODIC.find(v => v.nedelja === n);
}
