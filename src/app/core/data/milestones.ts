export interface Milestone {
  week: number;
  title: string;
  text: string;
}

export const PREGNANCY_MILESTONES: Milestone[] = [
  { week: 6, title: 'Prvi otkucaji srca', text: 'Srce bebe počinje da kuca — vidljivi su na ranom ultrazvuku.' },
  { week: 8, title: 'Otkucaji srca se čuju', text: 'Otkucaji srca često već mogu jasno da se čuju ili vide na ultrazvuku.' },
  { week: 12, title: 'Kraj prvog trimestra', text: 'Rizik od pobačaja značajno opada, a osnovni refleksi počinju da se razvijaju.' },
  { week: 16, title: 'Pol bebe', text: 'Pol bebe najčešće već može da se odredi na ultrazvuku.' },
  { week: 18, title: 'Prvi pokreti', text: 'Mnoge trudnice prvi put osete pokrete bebe — ono poznato „mešanje".' },
  { week: 20, title: 'Detaljan ultrazvuk (anomaly sken)', text: 'Detaljna provera organa i razvoja bebe, često i polovina trudnoće.' },
  { week: 24, title: 'Granica održivosti', text: 'Beba rođena od ove nedelje ima šansu za preživljavanje uz intenzivnu neonatalnu negu.' },
  { week: 27, title: 'Otvaranje očiju', text: 'Beba počinje da otvara oči i reaguje na svetlost izvan materice.' },
  { week: 28, title: 'Početak trećeg trimestra', text: 'Beba brzo dobija na težini, a pluća nastavljaju da sazrevaju.' },
  { week: 32, title: 'Vežba disanja', text: 'Beba vežba pokrete disanja, iako pluća još nisu potpuno zrela.' },
  { week: 37, title: 'Donošena trudnoća', text: 'Od ove nedelje porođaj se smatra bezbednim, a beba donošenom.' },
  { week: 39, title: 'Puna zrelost', text: 'Beba je potpuno spremna za rođenje.' },
  { week: 40, title: 'Termin porođaja', text: 'Očekivani datum porođaja — samo mali broj beba se rodi tačno na ovaj dan.' },
];

export type MilestoneStatus = 'proslo' | 'sada' | 'uskoro';

export function milestoneStatus(week: number, currentWeek: number): MilestoneStatus {
  if (week < currentWeek) return 'proslo';
  if (week === currentWeek) return 'sada';
  return 'uskoro';
}
