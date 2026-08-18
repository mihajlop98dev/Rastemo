export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
}

export const navItems: NavItem[] = [
  { label: 'Početna', path: '/home', icon: 'home' },
  { label: 'Praćenje trudnoće', path: '/tracking', icon: 'activity' },
  { label: 'Pregledi i nalazi', path: '/calendar', icon: 'clipboard-list' },
  { label: 'Lekari', path: '/doctors', icon: 'stethoscope' },
  { label: 'Zajednica', path: '/community', icon: 'users' },
  { label: 'AI pomoćnik', path: '/ai', icon: 'sparkles' },
  { label: 'Priprema', path: '/preparation', icon: 'shopping-bag' },
  { label: 'Profil', path: '/profile', icon: 'user' },
];

/** Prikazuje se u meniju samo ako je uloga admin ili moderator. */
export const adminNavItem: NavItem = { label: 'Administracija', path: '/admin', icon: 'shield' };

// Šest stavki na 375px daje oko 60px po stavci, pa su natpisi skraćeni da se ne
// lome u dva reda. AI pomoćnik mora da bude ovde: bez njega ga korisnice na
// telefonu ne bi videle nigde, jer levi meni postoji samo na širem ekranu.
export const mobileNavItems: NavItem[] = [
  { label: 'Početna', path: '/home', icon: 'home' },
  { label: 'Prati', path: '/tracking', icon: 'activity' },
  { label: 'AI', path: '/ai', icon: 'sparkles' },
  { label: 'Forum', path: '/community', icon: 'users' },
  { label: 'Lekari', path: '/doctors', icon: 'stethoscope' },
  { label: 'Profil', path: '/profile', icon: 'user' },
];
