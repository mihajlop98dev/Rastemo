/**
 * Kartica „Danas" na početnoj — menja se svakog dana trudnoće.
 *
 * Ranije je na početnoj stajao isti „Dnevni podsetnik" (Popij čašu vode…)
 * svakog dana, a opis nedelje se menjao tek jednom u trimestru. Posle drugog
 * otvaranja korisnica nije imala šta novo da vidi — pa se nije ni vraćala.
 *
 * Svaka stavka je jedna kratka stvar za taj dan: zanimljivost o bebi, nešto
 * o njoj, ili mala ideja koja vodi u deo aplikacije (beleška, fotografija,
 * pitanje za lekara). Sve su opšte, umirujuće tvrdnje — bez dijagnoza, doza
 * i saveta o terapiji.
 */
import { PREGNANCY_MILESTONES } from './milestones';

export type VrstaDana = 'beba' | 'ti' | 'ideja';

export interface DnevnaAkcija {
  label: string;
  link: string;
  query?: Record<string, string | number>;
}

export interface DnevnaStavka {
  vrsta: VrstaDana;
  tekst: string;
  akcija?: DnevnaAkcija;
}

const BELESKA: DnevnaAkcija = { label: 'Zapiši belešku', link: '/tracking', query: { tab: 'beleske' } };
const RASPOLOZENJE: DnevnaAkcija = { label: 'Zabeleži raspoloženje', link: '/tracking', query: { tab: 'raspolozenje' } };
const SIMPTOMI: DnevnaAkcija = { label: 'Zabeleži simptome', link: '/tracking', query: { tab: 'simptomi' } };
const PITANJE: DnevnaAkcija = { label: 'Dodaj pitanje za lekara', link: '/baby-development' };
const PREGLED: DnevnaAkcija = { label: 'Upiši pregled', link: '/calendar', query: { new: 1 } };
const TEZINA: DnevnaAkcija = { label: 'Upiši težinu', link: '/tracking', query: { tab: 'tezina' } };
const PRIPREMA: DnevnaAkcija = { label: 'Otvori listu', link: '/preparation' };
const IMENA: DnevnaAkcija = { label: 'Pogledaj imena', link: '/imena' };

const PRVI: DnevnaStavka[] = [
  { vrsta: 'beba', tekst: 'Bebino srce kuca skoro duplo brže od tvog — oko 110 do 160 puta u minuti.' },
  { vrsta: 'ti', tekst: 'Umor u prvim nedeljama je potpuno normalan. Telo upravo gradi posteljicu — to je ogroman posao koji se ne vidi.' },
  { vrsta: 'ideja', tekst: 'Zapiši kako si saznala da si trudna. Za par godina ćeš se radovati svakoj sitnici iz tog dana.', akcija: BELESKA },
  { vrsta: 'beba', tekst: 'Svi glavni organi bebe nastaju upravo u prvom trimestru. Zato se ovaj period i smatra najosetljivijim.' },
  { vrsta: 'ti', tekst: 'Ako ti smetaju mirisi koje si volela, nisi jedina — pojačan njuh je jedan od najčešćih ranih znakova trudnoće.' },
  { vrsta: 'ideja', tekst: 'Imaš li pitanje koje ne želiš da zaboraviš do pregleda? Zapiši ga sada, pa ga samo pročitaj kod lekara.', akcija: PITANJE },
  { vrsta: 'beba', tekst: 'Beba već ima zametke ruku i nogu koji liče na mala vesla. Prsti se razdvajaju nekoliko nedelja kasnije.' },
  { vrsta: 'ti', tekst: 'Mučnina često popušta oko kraja prvog trimestra. Do tada pomažu manji, češći obroci i suvi keks pored kreveta.' },
  { vrsta: 'ideja', tekst: 'Zabeleži danas kako se osećaš. Kad pogledaš unazad, videćeš kako se menja iz nedelje u nedelju.', akcija: RASPOLOZENJE },
  { vrsta: 'beba', tekst: 'Bebin mozak raste neverovatnom brzinom — u ovom periodu nastaju stotine hiljada nervnih ćelija svakog minuta.' },
  { vrsta: 'ti', tekst: 'Promene raspoloženja su hormonske, a ne tvoja greška. Reci bliskima kako se osećaš — lakše je kad znaju.' },
  { vrsta: 'ideja', tekst: 'Upiši datum sledećeg pregleda, a aplikacija će ga čuvati umesto tebe.', akcija: PREGLED },
  { vrsta: 'beba', tekst: 'Beba se već pomera, samo je još premala da bi se to osetilo. Prve pokrete žene obično osete između 16. i 22. nedelje.' },
  { vrsta: 'ti', tekst: 'Dremka posle podne nije lenjost. U prvom trimestru telu je odmor potreban više nego ikad.' },
  { vrsta: 'ideja', tekst: 'Napravi prvu fotografiju stomaka danas, iako se još ništa ne vidi. Kasnije ćeš biti srećna što imaš poređenje.' },
  { vrsta: 'beba', tekst: 'Na kraju prvog trimestra beba ima otiske prstiju — jedinstvene, kao i ona sama.' },
  { vrsta: 'ti', tekst: 'Česta potreba za mokrenjem u ranoj trudnoći je normalna — bubrezi rade više, a materica pritiska bešiku.' },
  { vrsta: 'ideja', tekst: 'Koji simptom ti danas najviše smeta? Kad ih beležiš, lakše ćeš lekaru objasniti kako ti je bilo.', akcija: SIMPTOMI },
  { vrsta: 'beba', tekst: 'Bebi već počinje da se formira lice: oči, nos i usne dobijaju svoje mesto.' },
  { vrsta: 'ti', tekst: 'Ne moraš svima odmah da kažeš. Mnoge žene čekaju kraj prvog trimestra — i to je potpuno u redu.' },
  { vrsta: 'ideja', tekst: 'Smislite zajedno nadimak za bebu dok joj ne izaberete ime. Mnogi parovi ga posle godinama pamte.' },
];

const DRUGI: DnevnaStavka[] = [
  { vrsta: 'beba', tekst: 'Beba počinje da čuje. Tvoj glas joj je najpoznatiji zvuk — slobodno joj pričaj ili pevaj.' },
  { vrsta: 'ti', tekst: 'Drugi trimestar mnoge žene zovu „medenim mesecom trudnoće" — energija se često vraća, a mučnina popušta.' },
  { vrsta: 'ideja', tekst: 'Pusti bebi pesmu koju voliš. Istraživanja pokazuju da bebe posle rođenja prepoznaju muziku koju su slušale u stomaku.' },
  { vrsta: 'beba', tekst: 'Beba ume da štuca. Kasnije ćeš to osetiti kao ritmično, blago lupkanje u stomaku.' },
  { vrsta: 'ti', tekst: 'Bol u leđima je čest kako stomak raste. Pomaže jastuk između kolena dok spavaš na boku.' },
  { vrsta: 'ideja', tekst: 'Fotografiši stomak danas, na istom mestu kao i prošli put. Niz takvih slika je najlepša uspomena na trudnoću.' },
  { vrsta: 'beba', tekst: 'Beba prolazi kroz periode sna i budnosti, i često je najaktivnija baš kad ti legneš da se odmoriš.' },
  { vrsta: 'ti', tekst: 'Ako ti se zapuši nos ili krvare desni, to je čest pratilac trudnoće — pojačan protok krvi deluje i na sluznice.' },
  { vrsta: 'ideja', tekst: 'Da li si već osetila prve pokrete? Zapiši datum i kako je to izgledalo — to je jedan od najlepših trenutaka.', akcija: BELESKA },
  { vrsta: 'beba', tekst: 'Bebina koža je prekrivena tankim zaštitnim slojem koji je čuva od plodove vode.' },
  { vrsta: 'ti', tekst: 'Upiši težinu jednom nedeljno, uvek u isto doba dana. Tako ćeš videti pravi trend, a ne dnevna kolebanja.', akcija: TEZINA },
  { vrsta: 'ideja', tekst: 'Počnite da razmišljate o imenu. Pogledajte šta koje ime znači i odakle dolazi.', akcija: IMENA },
  { vrsta: 'beba', tekst: 'Beba vežba sisanje — na ultrazvuku se ponekad vidi kako sisa palac.' },
  { vrsta: 'ti', tekst: 'Grčevi u listovima noću su česti u drugom trimestru. Istezanje pre spavanja ume da pomogne.' },
  { vrsta: 'ideja', tekst: 'Zapiši tri stvari koje želiš da pitaš na sledećem ultrazvuku.', akcija: PITANJE },
  { vrsta: 'beba', tekst: 'Bebina pluća se razvijaju i ona vežba pokrete disanja, iako još „diše" plodovu vodu.' },
  { vrsta: 'ti', tekst: 'Linija niz stomak koja tamni i promene na koži su od hormona i najčešće bledi posle porođaja.' },
  { vrsta: 'ideja', tekst: 'Pozovi partnera da stavi ruku na stomak kad beba bude aktivna. Spolja se pokreti osete nešto kasnije nego iznutra.' },
  { vrsta: 'beba', tekst: 'Beba reaguje na svetlost — ako jaka svetlost padne na stomak, ume da se okrene.' },
  { vrsta: 'ti', tekst: 'Žgaravica je česta kako materica raste. Manji obroci i ne leganje odmah posle jela obično pomažu.' },
  { vrsta: 'ideja', tekst: 'Danas je dobar dan da pogledaš listu stvari za bebu. Kupovina na vreme je mnogo opuštenija.', akcija: PRIPREMA },
];

const TRECI: DnevnaStavka[] = [
  { vrsta: 'beba', tekst: 'Beba sada najviše dobija na težini — do porođaja će se njena težina otprilike utrostručiti.' },
  { vrsta: 'ti', tekst: 'Kraći dah je normalan — materica pritiska dijafragmu. Obično se olakša kad se beba spusti pred porođaj.' },
  { vrsta: 'ideja', tekst: 'Danas je dobar dan da počneš da pakuješ torbu za porodilište. Lista je spremna u Pripremi.', akcija: PRIPREMA },
  { vrsta: 'beba', tekst: 'Beba otvara i zatvara oči, razlikuje svetlo i mrak i ima ritam sna.' },
  { vrsta: 'ti', tekst: 'Lažni trudovi — povremeno stezanje stomaka bez bola — način su na koji se materica priprema. Upiši ih u Kontrakcije ako želiš da pratiš.', akcija: { label: 'Kontrakcije', link: '/tracking', query: { tab: 'kontrakcije' } } },
  { vrsta: 'ideja', tekst: 'Napiši pismo bebi — šta osećaš sada, pred susret. Može da bude samo nekoliko rečenica.', akcija: BELESKA },
  { vrsta: 'beba', tekst: 'Beba prepoznaje tvoj glas, a često i glas partnera. Posle rođenja će se okretati ka njima.' },
  { vrsta: 'ti', tekst: 'Teško spavanje u trećem trimestru muči većinu žena. Jastuk ispod stomaka i između kolena mnogima pomaže.' },
  { vrsta: 'ideja', tekst: 'Proveri da li su dokumenta za porodilište na jednom mestu: lična karta, zdravstvena knjižica, nalazi.', akcija: PRIPREMA },
  { vrsta: 'beba', tekst: 'Beba ima sve manje mesta, pa su pokreti sada više meškoljenje i guranje nego udarci.' },
  { vrsta: 'ti', tekst: 'Prati pokrete bebe. Ako primetiš da se kreće primetno manje nego inače, javi se lekaru — bolje proveriti nego čekati.' },
  { vrsta: 'ideja', tekst: 'Upiši sledeće preglede da ti nijedan ne promakne — u trećem trimestru ih ima sve više.', akcija: PREGLED },
  { vrsta: 'beba', tekst: 'Bebin imuni sistem dobija antitela od tebe preko posteljice, i to je štiti prvih meseci posle rođenja.' },
  { vrsta: 'ti', tekst: 'Otekli zglobovi i stopala su česti uveče. Podigni noge kad sediš. Naglo oticanje lica i ruku javi lekaru.' },
  { vrsta: 'ideja', tekst: 'Napravite plan ko te vozi u porodilište i ko čuva kuću dok si unutra. Jedan razgovor sada štedi stres kasnije.' },
  { vrsta: 'beba', tekst: 'Većina beba se do kraja trudnoće okrene glavom nadole i tako se priprema za porođaj.' },
  { vrsta: 'ti', tekst: 'Osećaj da želiš sve da sredite i očistite pred porođaj ima ime — „gnežđenje". Samo nemoj da se premoriš.' },
  { vrsta: 'ideja', tekst: 'Fotografiši stomak danas. Uskoro će ovo biti poslednje slike pre susreta.' },
  { vrsta: 'beba', tekst: 'Beba vežba sisanje i gutanje svaki dan — priprema se za prvi obrok.' },
  { vrsta: 'ti', tekst: 'Svaka beba dolazi svojim tempom — samo mali broj se rodi tačno na dan termina.' },
  { vrsta: 'ideja', tekst: 'Zapiši kako se osećaš pred porođaj — i strahove i radost. Lakše je kad je napisano.', akcija: RASPOLOZENJE },
];

function bazen(nedelja: number): DnevnaStavka[] {
  if (nedelja <= 13) return PRVI;
  if (nedelja <= 27) return DRUGI;
  return TRECI;
}

/** Stavka za dati dan trudnoće — ista ceo dan, druga sutra. */
export function stavkaZaDan(danTrudnoce: number): DnevnaStavka {
  const nedelja = Math.floor(danTrudnoce / 7);
  const lista = bazen(nedelja);
  return lista[((danTrudnoce % lista.length) + lista.length) % lista.length];
}

export const NASLOV_VRSTE: Record<VrstaDana, string> = {
  beba: 'Da li si znala?',
  ti: 'Za tebe',
  ideja: 'Ideja za danas',
};

export interface SledecaPrekretnica {
  naslov: string;
  tekst: string;
  zaDana: number;
}

/**
 * Prva sledeća stvar koja se „otključava" — prekretnica ili novi trimestar.
 * Daje razlog da se aplikacija otvori i sledeće nedelje.
 */
export function sledecaPrekretnica(danTrudnoce: number): SledecaPrekretnica | null {
  const kandidati: Array<{ nedelja: number; naslov: string; tekst: string }> = [
    ...PREGNANCY_MILESTONES.map(m => ({ nedelja: m.week, naslov: m.title, tekst: m.text })),
    { nedelja: 14, naslov: 'Počinje drugi trimestar', tekst: 'Za mnoge žene najprijatniji deo trudnoće — energija se često vraća.' },
  ];
  const sledeci = kandidati
    .map(k => ({ ...k, zaDana: k.nedelja * 7 - danTrudnoce }))
    .filter(k => k.zaDana > 0)
    .sort((a, b) => a.zaDana - b.zaDana)[0];
  return sledeci ? { naslov: sledeci.naslov, tekst: sledeci.tekst, zaDana: sledeci.zaDana } : null;
}

/** „1 dan", „3 dana", „5 dana", „21 dan" — srpska množina. */
export function danaTekst(n: number): string {
  const d10 = n % 10, d100 = n % 100;
  return d10 === 1 && d100 !== 11 ? `${n} dan` : `${n} dana`;
}
