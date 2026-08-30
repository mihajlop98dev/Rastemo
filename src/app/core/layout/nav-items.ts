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
  { label: 'Praćenje trudnoće', path: '/tracking', icon: 'activity' },
  { label: 'Pregledi i nalazi', path: '/calendar', icon: 'clipboard-list' },
  { label: 'Lekari', path: '/doctors', icon: 'stethoscope' },
  // Forum je javan; ista adresa i iz aplikacije i sa sajta.
  { label: 'Zajednica', path: '/zajednica', icon: 'users' },
  { label: 'Priprema', path: '/preparation', icon: 'shopping-bag' },
  { label: 'Profil', path: '/profile', icon: 'user' },
];

/** Prikazuje se u meniju samo ako je uloga admin ili moderator. */
export const adminNavItem: NavItem = { label: 'Administracija', path: '/admin', icon: 'shield' };

// Natpisi su skraćeni da se na 375px ne lome u dva reda. Levi meni postoji samo
// na širem ekranu, pa sve što nije ovde korisnica na telefonu ne može da otvori.
export const mobileNavItems: NavItem[] = [
  { label: 'Početna', path: '/home', icon: 'home' },
  { label: 'Prati', path: '/tracking', icon: 'activity' },
  { label: 'Forum', path: '/zajednica', icon: 'users' },
  { label: 'Lekari', path: '/doctors', icon: 'stethoscope' },
  { label: 'Profil', path: '/profile', icon: 'user' },
];
