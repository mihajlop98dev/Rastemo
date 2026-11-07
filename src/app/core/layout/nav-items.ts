export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
}

export const navItems: NavItem[] = [
  { label: 'Početna', path: '/home', icon: 'home' },
  // Nastavak iste priče o nedelji kao i početna, pa stoji odmah ispod nje.
  // Do ovog ekrana se ranije dolazilo samo preko dugmeta na početnoj, a na
  // njemu su i pitanja za lekara.
  { label: 'Razvoj bebe', path: '/baby-development', icon: 'baby' },
  { label: 'Moj dnevnik', path: '/tracking', icon: 'activity' },
  { label: 'Pregledi i nalazi', path: '/calendar', icon: 'clipboard-list' },
  { label: 'Lekari', path: '/doctors', icon: 'stethoscope' },
  // Forum je javan; ista adresa i iz aplikacije i sa sajta.
  { label: 'Zajednica', path: '/zajednica', icon: 'users' },
  { label: 'Priprema', path: '/preparation', icon: 'shopping-bag' },
  // Vodi na javni deo sajta. Prijavljena korisnica inace nema kako da dodje do
  // imena, kalkulatora i ostalih alatki — sve to zivi van aplikacije.
  { label: 'Zabava', path: '/zabava', icon: 'sparkles' },
  { label: 'Profil', path: '/profile', icon: 'user' },
];

/** Prikazuje se u meniju samo ako je uloga admin ili moderator. */
export const adminNavItem: NavItem = { label: 'Administracija', path: '/admin', icon: 'shield' };

// Natpisi su skraćeni da se na 375px ne lome u dva reda. Levi meni postoji samo
// na širem ekranu; sve što nije ovde ima ulaz u „Još u aplikaciji" na početnoj.
//
// Forum i Lekari su izašli iz donjeg menija (nov. 2026): forum je imao nula
// odgovora i prazan ekran u glavnom meniju je odbijao nove korisnice, a
// Pregledi — funkcija koju korisnice stvarno koriste — nisu bili u meniju.
export const mobileNavItems: NavItem[] = [
  { label: 'Početna', path: '/home', icon: 'home' },
  { label: 'Beba', path: '/baby-development', icon: 'baby' },
  { label: 'Dnevnik', path: '/tracking', icon: 'activity' },
  { label: 'Pregledi', path: '/calendar', icon: 'clipboard-list' },
  { label: 'Profil', path: '/profile', icon: 'user' },
];
