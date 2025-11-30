export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
}

export interface Concert {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface Profile {
  name: string;
  role: string;
  bioShort: string;
  history: string[];
}

export type ThemeType = 'analysis' | 'royal' | 'editorial' | 'nocturne' | 'studio' | 'stage' | 'nature';

export interface NavItem {
  label: string;
  href: string; // Used as ID for scrolling
}