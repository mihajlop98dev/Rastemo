export interface WeekHighlight {
  icon: string;
  title: string;
  text: string;
}

export interface Appointment {
  id: string;
  date: string;
  day: string;
  month: string;
  time: string;
  title: string;
  subtitle: string;
  doctor: string;
  clinic: string;
  type: 'pregled' | 'analize' | 'ultrazvuk';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  city: string;
  rating: number;
  reviewCount: number;
  photo?: string;
  clinic: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  category: string;
  author: string;
  replies: number;
  time: string;
  pinned?: boolean;
}

export const currentUser = {
  name: 'Marija',
  fullName: 'Marija Petrović',
  city: 'Beograd, Srbija',
  email: 'marija.petrovic@email.com',
  birthDate: '05.05.1990.',
  weight: '68 kg',
  weekNumber: 21,
  weekDays: 3,
  totalWeeks: 40,
  dueDate: '21. decembar 2026.',
  babyLength: 27,
  babyWeight: 360,
  babyComparison: 'nara',
};

export const weekHighlights: WeekHighlight[] = [
  {
    icon: 'baby',
    title: 'Beba',
    text: 'Beba intenzivno razvija čula. Možeš početi da primećuješ njene prve pokrete.',
  },
  {
    icon: 'heart',
    title: 'Ti',
    text: 'Mogući su umor, bol u leđima i pojačana potreba za odmorom.',
  },
  {
    icon: 'info',
    title: 'Važno',
    text: 'Pij dovoljno vode, odmaraj se i posveti pažnju svojoj ishrani i dobrobiti.',
  },
];

export const nextAppointment: Appointment = {
  id: 'apt-1',
  date: '18',
  day: '18',
  month: 'AVG',
  time: '10:30',
  title: 'Ginekolog',
  subtitle: 'Pregled + ultrazvuk',
  doctor: 'dr Jelena Petrović',
  clinic: 'Klinika Sunce',
  type: 'pregled',
};

export const upcomingAppointments: Appointment[] = [
  nextAppointment,
  { id: 'apt-2', date: '22', day: '22', month: 'AVG', time: '08:00', title: 'Laboratorijske analize', subtitle: 'Analize krvi', doctor: '', clinic: 'BioLab', type: 'analize' },
  { id: 'apt-3', date: '05', day: '05', month: 'SEP', time: '11:00', title: 'Kontrola kod ginekologa', subtitle: 'Redovna kontrola', doctor: 'dr Jelena Petrović', clinic: 'Klinika Sunce', type: 'pregled' },
  { id: 'apt-4', date: '12', day: '12', month: 'SEP', time: '16:00', title: '3D/4D ultrazvuk', subtitle: 'Detaljan ultrazvuk', doctor: '', clinic: 'Baby Vision', type: 'ultrazvuk' },
];

export const doctors: Doctor[] = [
  { id: 'd1', name: 'dr Jelena Petrović', specialty: 'Ginekolog · akušer', city: 'Beograd', rating: 4.9, reviewCount: 128, clinic: 'Klinika Sunce' },
  { id: 'd2', name: 'dr Marko Nikolić', specialty: 'Ginekolog · akušer', city: 'Novi Sad', rating: 4.8, reviewCount: 96, clinic: 'Poliklinika Vita' },
  { id: 'd3', name: 'dr Ana Kovačević', specialty: 'Ginekolog · akušer', city: 'Niš', rating: 4.7, reviewCount: 74, clinic: 'Medical Centar' },
  { id: 'd4', name: 'dr Milica Jovanović', specialty: 'Perinatolog', city: 'Beograd', rating: 4.9, reviewCount: 61, clinic: 'Klinika Sunce' },
];

export const forumTopics: ForumTopic[] = [
  { id: 't1', title: 'Da li je normalno da beba mrda u 22. nedelji?', category: 'Drugi trimestar', author: 'Anonimna trudnica', replies: 12, time: 'pre 2h', pinned: true },
  { id: 't2', title: 'Iskustva sa 3D ultrazvukom', category: 'Pregledi', author: 'Jovana92', replies: 8, time: 'pre 4h' },
  { id: 't3', title: 'Kako se borite sa nesanicom?', category: 'Simptomi', author: 'Anonimna trudnica', replies: 21, time: 'pre 6h' },
  { id: 't4', title: 'Priprema torbe za porodilište — šta vam je zaista trebalo?', category: 'Priprema', author: 'Teodora_M', replies: 34, time: 'pre 1d' },
];

export const forumCategories = [
  { name: 'Prvi trimestar', count: '1.2k' },
  { name: 'Drugi trimestar', count: '1.8k' },
  { name: 'Treći trimestar', count: '2.1k' },
];
