export type NutritionLevel = 'izbegavati' | 'ograniciti' | 'preporucljivo';

export interface NutritionItem {
  name: string;
  note: string;
}

export interface NutritionGroup {
  title: string;
  level: NutritionLevel;
  items: NutritionItem[];
}

export const NUTRITION_GUIDE: NutritionGroup[] = [
  {
    title: 'Izbegavaj potpuno',
    level: 'izbegavati',
    items: [
      { name: 'Alkohol', note: 'Ne postoji bezbedna količina tokom trudnoće.' },
      { name: 'Sirovo ili nedovoljno pečeno meso', note: 'Rizik od toksoplazmoze i salmonele.' },
      { name: 'Sirovo ili polutečno jaje', note: 'Domaći majonez, tiramisu — rizik od salmonele.' },
      { name: 'Nepasterizovano mleko i meki sirevi', note: 'Brie, camembert, plava plesan — rizik od listerije.' },
      { name: 'Sirova riba i školjke', note: 'Suši, ostrige — rizik od parazita i bakterija.' },
      { name: 'Riba bogata živom', note: 'Ajkula, sabljarka, kraljevska skuša, tunjevina veliko oko.' },
      { name: 'Iznutrice u većim količinama', note: 'Previsok unos vitamina A (npr. jetra).' },
      { name: 'Nepasterizovani sokovi', note: 'Rizik od bakterijske kontaminacije.' },
    ],
  },
  {
    title: 'Ograniči',
    level: 'ograniciti',
    items: [
      { name: 'Kofein', note: 'Do 200 mg dnevno — otprilike jedna do dve šoljice kafe.' },
      { name: 'Riba sa umerenim sadržajem žive', note: 'Do 2–3 obroka nedeljno; losos, list i pastrmka su bezbedniji izbor.' },
      { name: 'So i visoko prerađena hrana', note: 'Može doprineti oticanju i povišenom pritisku.' },
      { name: 'Zaslađeni napici i previše šećera', note: 'Rizik od prekomernog dobijanja na težini i gestacijskog dijabetesa.' },
    ],
  },
  {
    title: 'Vodi računa da uneseš',
    level: 'preporucljivo',
    items: [
      { name: 'Folna kiselina', note: 'Posebno važna u prvom trimestru za razvoj nervnog sistema bebe.' },
      { name: 'Gvožđe', note: 'Crveno meso, spanać, mahunarke — sprečava anemiju.' },
      { name: 'Kalcijum', note: 'Mlečni proizvodi, brokoli — za razvoj kostiju bebe.' },
      { name: 'Voda', note: 'Najmanje 2 litra dnevno, više u toplijim danima.' },
      { name: 'Vlakna', note: 'Voće, povrće, celo zrno — pomažu kod zatvora, čestog problema u trudnoći.' },
    ],
  },
];
