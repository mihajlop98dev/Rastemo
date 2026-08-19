/**
 * Pravni tekstovi aplikacije.
 *
 * TERMS_VERSION se upisuje u profiles.terms_version zajedno sa datumom
 * prihvatanja. Kad se tekst materijalno promeni, podigni verziju — korisnice
 * koje su prihvatile stariju verziju biće ponovo pitane da prihvate novu.
 */
export const TERMS_VERSION = '2026-08-19';

/** Email na koji stižu zahtevi po ZZPL/GDPR i sva pravna pitanja. */
export const LEGAL_CONTACT_EMAIL = 'mihajlop98@gmail.com';

/**
 * Naziv pod kojim sajt istupa. Nije registrovan subjekt — samo ime brenda.
 * Koristi se svuda gde je dovoljno reći ko stoji iza sajta.
 */
export const BRAND_NAME = 'VVK Digital';

/**
 * Rukovalac podacima o ličnosti.
 *
 * Ovde mora stajati stvarni identitet, ne brend: korisnica ima pravo da zna
 * kome se obraća kad traži uvid ili brisanje svojih podataka, a iza naziva
 * „VVK Digital" ne stoji registrovan subjekt kome bi se zahtev mogao uputiti.
 * Zato ime brenda ide uz ime lica, a ne umesto njega.
 *
 * Kad se registruje firma, ovde ide njeno puno poslovno ime i matični broj,
 * i podigne se TERMS_VERSION da korisnice ponovo prihvate uslove.
 */
export const DATA_CONTROLLER = 'Mihajlo Petrović';

/** Oblik za pravne tekstove: brend uz lice koje stvarno odgovara. */
export const LEGAL_ENTITY = `${BRAND_NAME} (${DATA_CONTROLLER})`;

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const TERMS_DOCUMENT: LegalDocument = {
  title: 'Uslovi korišćenja',
  updated: '19. avgust 2026.',
  intro:
    `Ovi uslovi uređuju korišćenje aplikacije „Dnevnik trudnoće”, koju pod nazivom ${BRAND_NAME} ` +
    `pruža ${DATA_CONTROLLER} kao fizičko lice. Molimo te da ih pažljivo pročitaš — ` +
    'korišćenjem aplikacije potvrđuješ da si ih pročitala, razumela i da ih prihvataš u celosti.',
  sections: [
    {
      heading: '1. Šta je Dnevnik trudnoće',
      paragraphs: [
        'Dnevnik trudnoće je aplikacija na kojoj možeš da pratiš nedelje trudnoće, ' +
          'beležiš simptome, raspoloženje, težinu i kontrakcije, vodiš evidenciju terapije, ' +
          'organizuješ preglede i razmenjuješ iskustva sa drugim trudnicama.',
        'Dnevnik trudnoće je isključivo informativnog i organizacionog karaktera. Aplikacija nije zdravstvena ' +
          'ustanova, nije medicinsko sredstvo i ne pruža zdravstvenu uslugu u smislu propisa Republike Srbije.',
      ],
    },
    {
      heading: '2. Dnevnik trudnoće ne daje medicinske savete',
      paragraphs: [
        'Sav sadržaj u aplikaciji — tekstovi o razvoju bebe, preporučeni rasponi težine, saveti o ishrani, ' +
          'važni datumi, podsetnici i bilo koji drugi materijal — ima opšti, edukativni karakter. ' +
          'Taj sadržaj NIJE medicinski savet, dijagnoza, terapija niti zamena za pregled kod lekara.',
        'Svaka trudnoća je drugačija. Podaci i rasponi prikazani u aplikaciji su prosečne vrednosti iz ' +
          'javno dostupnih stručnih izvora i ne moraju odgovarati tvom stanju.',
        'Nikada nemoj da odlažeš odlazak lekaru, prekidaš ili menjaš propisanu terapiju, niti da počinješ ' +
          'novu terapiju ili suplementaciju na osnovu nečega što si pročitala u aplikaciji. Za svaku odluku ' +
          'koja se tiče tvog zdravlja i zdravlja tvoje bebe obrati se svom ginekologu ili drugom ' +
          'nadležnom zdravstvenom radniku.',
      ],
    },
    {
      heading: '3. Hitni slučajevi',
      paragraphs: [
        'Dnevnik trudnoće nije namenjen prijavljivanju hitnih stanja i ne prati tvoje unose u realnom vremenu. ' +
          'Ako imaš krvarenje, jak ili uporan bol, curenje plodove vode, izostanak pokreta bebe, visok ' +
          'pritisak, temperaturu, poremećaj vida ili bilo koji drugi zabrinjavajući simptom — odmah pozovi ' +
          'Hitnu pomoć na 194 ili se javi najbližoj zdravstvenoj ustanovi.',
      ],
    },
    {
      heading: '4. Alati za praćenje',
      paragraphs: [
        'Kalkulator težine, merač kontrakcija, evidencija terapije i slični alati služe da ti olakšaju ' +
          'vođenje beleški. Njihovi rezultati su orijentacioni i zavise isključivo od podataka koje ti uneseš.',
        'Aplikacija ne proverava tačnost tvojih unosa, ne prepoznaje komplikacije, ne upozorava na opasna ' +
          'stanja i ne garantuje da će podsetnik stići na vreme. Odgovornost za tumačenje rezultata i za ' +
          'svaku odluku donetu na osnovu njih je isključivo tvoja i tvog lekara.',
      ],
    },
    {
      heading: '5. Nalog i tvoje obaveze',
      bullets: [
        'Nalog možeš da otvoriš ako imaš najmanje 18 godina i poslovnu sposobnost.',
        'Podaci koje unosiš treba da budu tačni; ti si odgovorna za njihovu ispravnost i ažurnost.',
        'Čuvaj svoju lozinku i ne deli pristup nalogu sa drugima.',
        'Nalog koristiš lično i ne smeš ga ustupati trećim licima.',
        'Obavesti nas bez odlaganja ako posumnjaš da je neko neovlašćeno pristupio tvom nalogu.',
      ],
    },
    {
      heading: '6. Zajednica i sadržaj korisnica',
      paragraphs: [
        'Teme, komentari i poruke koje objavljuju druge korisnice predstavljaju njihova lična iskustva i ' +
          'mišljenja. Dnevnik trudnoće taj sadržaj ne kreira, ne proverava unapred i ne stoji iza njega. ' +
          'Iskustvo druge trudnice nije preporuka za tebe.',
        'Zabranjeno je objavljivati sadržaj koji je uvredljiv, diskriminatoran, neistinit, protivpravan, ' +
          'koji predstavlja reklamu, koji nudi konkretne medicinske instrukcije drugim korisnicama ili ' +
          'koji otkriva tuđe lične podatke. Zadržavamo pravo da takav sadržaj uklonimo i da nalog ' +
          'ograničimo ili ugasimo, bez prethodne najave.',
      ],
    },
    {
      heading: '7. Podaci o lekarima i ustanovama',
      paragraphs: [
        'Podaci o lekarima i zdravstvenim ustanovama služe za lakše snalaženje. Dnevnik trudnoće ne posreduje u ' +
          'zakazivanju, ne proverava stručne kvalifikacije i ne preporučuje nijednog konkretnog lekara.',
        'Ocene i komentari su subjektivni utisci korisnica. Ne garantujemo njihovu tačnost i ne odgovaramo ' +
          'za posledice izbora zdravstvenog radnika ili ustanove.',
      ],
    },
    {
      heading: '8. Ograničenje odgovornosti',
      paragraphs: [
        'Aplikacija se pruža „takva kakva jeste“ i „prema dostupnosti“. U meri u kojoj to dopuštaju ' +
          'propisi Republike Srbije, ne odgovaramo za:',
      ],
      bullets: [
        'odluke koje doneseš ili propustiš da doneseš oslanjajući se na sadržaj aplikacije;',
        'netačnost, nepotpunost ili neažurnost prikazanih informacija;',
        'sadržaj koji objave druge korisnice ili sadržaj sa sajtova na koje vode linkovi iz aplikacije;',
        'prekide u radu, greške, gubitak podataka ili nedostupnost usluge;',
        'izostanak ili kašnjenje podsetnika i obaveštenja;',
        'posrednu štetu, izmaklu korist ili nematerijalnu štetu.',
      ],
    },
    {
      heading: '9. Šta ovim uslovima ne isključujemo',
      paragraphs: [
        'Ništa u ovim uslovima ne isključuje niti ograničava našu odgovornost za štetu prouzrokovanu ' +
          'namerno ili krajnjom nepažnjom, za povredu prava na zaštitu podataka o ličnosti, kao ni bilo ' +
          'koju drugu odgovornost koja se po prinudnim propisima Republike Srbije ne može isključiti.',
      ],
    },
    {
      heading: '10. Dostupnost i izmene usluge',
      paragraphs: [
        'Trudimo se da aplikacija radi neprekidno, ali ne garantujemo dostupnost bez prekida. ' +
          'Možemo da menjamo, privremeno obustavimo ili trajno ukinemo pojedine funkcije ili celu ' +
          'aplikaciju. Ako planiramo trajno gašenje, obavestićemo te unapred kako bi mogla da ' +
          'preuzmeš svoje podatke.',
      ],
    },
    {
      heading: '11. Intelektualna svojina',
      paragraphs: [
        'Naziv, logotip, dizajn, ilustracije, tekstovi i softver aplikacije su zaštićeni i ostaju naše ' +
          'vlasništvo ili vlasništvo naših davalaca licence. Možeš ih koristiti isključivo u okviru ' +
          'uobičajenog korišćenja aplikacije.',
        'Sadržaj koji ti objaviš ostaje tvoj. Objavljivanjem nam daješ neisključivo pravo da ga ' +
          'prikazujemo u okviru aplikacije, u meri neophodnoj za pružanje usluge.',
      ],
    },
    {
      heading: '12. Prestanak korišćenja',
      paragraphs: [
        'Nalog možeš da ugasiš u svakom trenutku. Možemo da ti ograničimo ili ukinemo pristup ako ' +
          'prekršiš ove uslove ili ako to nalaže propis. Odredbe o ograničenju odgovornosti i ' +
          'intelektualnoj svojini ostaju na snazi i posle prestanka korišćenja.',
      ],
    },
    {
      heading: '13. Izmene uslova',
      paragraphs: [
        'Uslove možemo menjati. Ako izmena bitno utiče na tvoja prava, tražićemo da nove uslove ponovo ' +
          'prihvatiš prilikom sledeće prijave. Datum poslednje izmene uvek stoji na vrhu ove stranice.',
      ],
    },
    {
      heading: '14. Merodavno pravo i rešavanje sporova',
      paragraphs: [
        'Na ove uslove primenjuje se pravo Republike Srbije. Sporove ćemo prvenstveno pokušati da ' +
          'rešimo dogovorom; ako to ne uspe, nadležan je stvarno nadležni sud u Beogradu.',
      ],
    },
    {
      heading: '15. Kontakt',
      paragraphs: [
        `Za sva pitanja u vezi sa ovim uslovima piši nam na ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
  ],
};

export const PRIVACY_DOCUMENT: LegalDocument = {
  title: 'Politika privatnosti',
  updated: '19. avgust 2026.',
  intro:
    'U aplikaciji Dnevnik trudnoće obrađujemo podatke o tvom zdravlju i zdravlju tvoje bebe. To su naročito ' +
    'osetljivi podaci i prema njima se odnosimo sa posebnom pažnjom. Ovde ti otvoreno objašnjavamo ' +
    'šta prikupljamo, zašto, kome to poveravamo i koja prava imaš.',
  sections: [
    {
      heading: '1. Ko obrađuje tvoje podatke',
      paragraphs: [
        `Sajt i aplikacija posluju pod nazivom ${BRAND_NAME}. Iza tog naziva ne stoji ` +
          `registrovano privredno društvo — rukovalac podacima je ${DATA_CONTROLLER}, kao ` +
          `fizičko lice, i on lično odgovara za obradu tvojih podataka. Za sva pitanja o zaštiti ` +
          `podataka, kao i za ostvarivanje svojih prava, možeš se obratiti na ${LEGAL_CONTACT_EMAIL}.`,
        'Obradu vršimo u skladu sa Zakonom o zaštiti podataka o ličnosti Republike Srbije i Opštom ' +
          'uredbom o zaštiti podataka (GDPR).',
      ],
    },
    {
      heading: '2. Koje podatke prikupljamo',
      bullets: [
        'Podaci o nalogu: ime i prezime, email adresa, grad, datum rođenja, fotografija profila.',
        'Podaci o trudnoći: termin porođaja, datum poslednje menstruacije, način začeća, ime i pol bebe.',
        'Zdravstveni podaci: simptomi, raspoloženje, telesna težina, kontrakcije, terapija i suplementi, ' +
          'beleške iz dnevnika, zakazani pregledi.',
        'Sadržaj koji objaviš: teme, komentari i privatne poruke drugim korisnicama.',
        'Tehnički podaci: IP adresa, tip uređaja i pregledača, vreme pristupa i osnovni dnevnici rada ' +
          'sistema, neophodni za bezbednost i otklanjanje grešaka.',
      ],
    },
    {
      heading: '3. Zašto ih obrađujemo i po kom osnovu',
      bullets: [
        'Zdravstvene podatke obrađujemo isključivo na osnovu tvoje izričite saglasnosti — ti sama biraš ' +
          'šta ćeš uneti, a saglasnost možeš povući u svakom trenutku brisanjem unosa ili naloga.',
        'Podatke o nalogu obrađujemo radi izvršenja ugovora, odnosno kako bismo ti uopšte omogućili ' +
          'korišćenje aplikacije.',
        'Tehničke podatke obrađujemo na osnovu legitimnog interesa — bezbednost sistema, sprečavanje ' +
          'zloupotreba i unapređenje aplikacije.',
        'Podatke možemo obrađivati i kada nam to nalaže zakon.',
      ],
    },
    {
      heading: '4. Kome poveravamo podatke',
      paragraphs: [
        'Ne prodajemo tvoje podatke i ne koristimo ih za reklamiranje. Poveravamo ih samo pružaocima ' +
          'usluga koji su nam neophodni da bi aplikacija radila, i to na osnovu ugovora o obradi:',
      ],
      bullets: [
        'Supabase — baza podataka i autentikacija;',
        'Vercel — hosting aplikacije;',
        'Google — ako se prijaviš preko Google naloga, u obimu neophodnom za prijavu; ' +
          'i Google analitika, ali samo ako si na to pristala (vidi odeljak 4a).',
      ],
    },
    {
      heading: '4a. Kolačići i merenje poseta',
      paragraphs: [
        'Aplikacija koristi kolačiće koji su neophodni da bi radila — oni te drže prijavljenom i ' +
          'pamte tvoja podešavanja. Bez njih aplikacija ne može da funkcioniše i za njih se ' +
          'saglasnost ne traži.',
        'Odvojeno od toga, želeli bismo da merimo posete pomoću Google analitike, kako bismo videli ' +
          'koji ekrani su korisni a koji smetaju. To nije neophodno za rad aplikacije, pa se učitava ' +
          'tek ako na to izričito pristaneš. Dok ne pristaneš, Google analitika se uopšte ne pokreće.',
        'Ako pristaneš, Google-u se šalje koja je stranica otvorena, kada, i osnovni podaci o uređaju ' +
          'i pregledaču. Iz adrese stranice uklanjamo sve što bi moglo da te oda — pojmove iz pretrage ' +
          'i identifikatore tema. Tvoji unosi se ne šalju nikada: ni simptomi, ni raspoloženje, ni ' +
          'težina, ni beleške, ni poruke, ni podaci o trudnoći.',
        'Merenje ne koristimo za oglašavanje. Reklamni kolačići su isključeni i ne pravimo profile za ' +
          'ciljanje oglasa.',
        'Svoj izbor možeš promeniti u svakom trenutku: Profil → Privatnost → Merenje poseta. ' +
          'Povlačenje saglasnosti je jednako lako kao i davanje.',
      ],
    },
    {
      heading: '4b. Podaci o lekarima',
      paragraphs: [
        'U aplikaciji postoji spisak ginekologa-akušera preuzet iz javno objavljenog registra izdatih ' +
          'licenci Lekarske komore Srbije. Taj registar Komora objavljuje po zakonu, upravo zato da bi ' +
          'svako mogao da proveri ko sme da se bavi lekarskom praksom.',
        'Iz registra preuzimamo samo ime i prezime, titulu, broj licence, specijalizaciju i rok važenja ' +
          'licence. Ne preuzimamo adresu, telefon, matični broj niti bilo koji privatni podatak. Grad i ' +
          'ustanovu dopunjuju korisnice aplikacije.',
        'Pravni osnov je legitimni interes — da trudnica može da proveri da lekar kod koga ide zaista ' +
          'ima važeću licencu. Podatke ne koristimo za oglašavanje i ne prodajemo ih.',
        'Ako ste lekar i ne želite da budete na spisku, ili je neki podatak o vama netačan, pišite nam ' +
          `na ${LEGAL_CONTACT_EMAIL}. Uklonićemo ili ispraviti unos bez objašnjenja i bez odlaganja.`,
        'Ocene i komentari korisnica su njihova lična iskustva, a ne stav aplikacije. Uvredljiv ili ' +
          'neistinit sadržaj uklanjamo na prijavu.',
      ],
    },
    {
      heading: '5. Prenos podataka izvan Srbije',
      paragraphs: [
        'Serveri navedenih pružalaca usluga mogu se nalaziti izvan Republike Srbije, uključujući ' +
          'Evropsku uniju i Sjedinjene Američke Države. Prenos se vrši uz odgovarajuće mere zaštite ' +
          '(standardne ugovorne klauzule i tehničke mere zaštite podataka).',
      ],
    },
    {
      heading: '6. Koliko dugo čuvamo podatke',
      paragraphs: [
        'Podatke čuvamo dok imaš aktivan nalog. Kada ugasiš nalog, tvoji lični i zdravstveni podaci se ' +
          'brišu iz aktivne baze, a rezervne kopije se prepisuju u redovnom ciklusu, najkasnije u roku ' +
          'od 30 dana. Podatke koje smo dužni da zadržimo po zakonu čuvamo samo u tom zakonskom roku.',
      ],
    },
    {
      heading: '7. Tvoja prava',
      bullets: [
        'Pristup — da saznaš koje podatke o tebi imamo i da dobiješ njihovu kopiju.',
        'Ispravka — da ispraviš netačne ili dopuniš nepotpune podatke.',
        'Brisanje — da tražiš da tvoje podatke obrišemo.',
        'Ograničenje obrade i prigovor na obradu.',
        'Prenosivost — da svoje podatke preuzmeš u čitljivom formatu; izvoz je dostupan u Profilu, ' +
          'u sekciji „Izveštaj podataka“.',
        'Povlačenje saglasnosti u svakom trenutku, bez uticaja na obradu koja je izvršena pre povlačenja.',
        'Pritužba Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti Republike Srbije.',
      ],
      paragraphs: [
        `Zahtev možeš poslati na ${LEGAL_CONTACT_EMAIL}. Odgovaramo najkasnije u roku od 30 dana.`,
      ],
    },
    {
      heading: '8. Bezbednost',
      paragraphs: [
        'Podaci se prenose šifrovanom vezom, pristup bazi je ograničen pravilima koja obezbeđuju da ' +
          'svaka korisnica vidi isključivo svoje podatke, a lozinke se čuvaju u kriptografski ' +
          'zaštićenom obliku.',
        'Nijedan sistem nije apsolutno bezbedan. Ako ipak dođe do povrede podataka koja može da ' +
          'ugrozi tvoja prava, obavestićemo tebe i nadležni organ u zakonskom roku.',
      ],
    },
    {
      heading: '9. Kolačići i lokalno skladište',
      paragraphs: [
        'Koristimo samo tehnički neophodno lokalno skladište pregledača, kako bi ostala prijavljena ' +
          'između poseta. Ne koristimo marketinške niti kolačiće za praćenje u druge svrhe.',
      ],
    },
    {
      heading: '10. Uzrast korisnica',
      paragraphs: [
        'Aplikacija je namenjena punoletnim osobama. Ako saznamo da smo prikupili podatke maloletnog ' +
          'lica bez odgovarajućeg osnova, te podatke ćemo obrisati.',
      ],
    },
    {
      heading: '11. Izmene politike',
      paragraphs: [
        'Ovu politiku možemo dopunjavati. O bitnim izmenama obavestićemo te u aplikaciji, a datum ' +
          'poslednje izmene uvek stoji na vrhu stranice.',
      ],
    },
  ],
};
