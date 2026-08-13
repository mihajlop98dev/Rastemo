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
  { label: 'AI pomoćnik', path: '/ai', icon: 'sparkles', badge: 'Uskoro' },
  { label: 'Priprema', path: '/preparation', icon: 'shopping-bag' },
  { label: 'Profil', path: '/profile', icon: 'user' },
];

export const mobileNavItems: NavItem[] = [
  { label: 'Početna', path: '/home', icon: 'home' },
  { label: 'Praćenje', path: '/tracking', icon: 'activity' },
  { label: 'Zajednica', path: '/community', icon: 'users' },
  { label: 'Lekari', path: '/doctors', icon: 'stethoscope' },
  { label: 'Profil', path: '/profile', icon: 'user' },
];
