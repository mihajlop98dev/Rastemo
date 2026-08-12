export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { label: 'Početna', path: '/pocetna', icon: 'home' },
  { label: 'Praćenje trudnoće', path: '/pracenje', icon: 'activity' },
  { label: 'Pregledi i nalazi', path: '/kalendar', icon: 'clipboard-list' },
  { label: 'Lekari', path: '/lekari', icon: 'stethoscope' },
  { label: 'Zajednica', path: '/zajednica', icon: 'users' },
  { label: 'AI pomoćnik', path: '/ai', icon: 'sparkles' },
  { label: 'Priprema', path: '/priprema', icon: 'shopping-bag' },
  { label: 'Partner', path: '/partner', icon: 'heart' },
  { label: 'Profil', path: '/profil', icon: 'user' },
];

export const mobileNavItems: NavItem[] = [
  { label: 'Početna', path: '/pocetna', icon: 'home' },
  { label: 'Praćenje', path: '/pracenje', icon: 'activity' },
  { label: 'Zajednica', path: '/zajednica', icon: 'users' },
  { label: 'Lekari', path: '/lekari', icon: 'stethoscope' },
  { label: 'Profil', path: '/profil', icon: 'user' },
];
