export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  baseColor: string;
  primaryAccent: string;
  secondaryAccent: string;
  textColor: string;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'midnight-galaxy',
    name: 'Midnight Galaxy',
    description: 'Deep cosmic purples and mystic lavender accents',
    baseColor: '#1b1328',
    primaryAccent: '#a490c2',
    secondaryAccent: '#4a4e8f',
    textColor: '#e6e6fa',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm autumnal ochre and terracotta glow',
    baseColor: '#1a1614',
    primaryAccent: '#f4a900',
    secondaryAccent: '#c1666b',
    textColor: '#fdf6ed',
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    description: 'Abyssal deep navy and bioluminescent seafoam teal',
    baseColor: '#1a2332',
    primaryAccent: '#2d8b8b',
    secondaryAccent: '#a8dadc',
    textColor: '#f1faee',
  },
  {
    id: 'forest-canopy',
    name: 'Forest Canopy',
    description: 'Verdant woodland moss and earthy sage tones',
    baseColor: '#1b291a',
    primaryAccent: '#7d8471',
    secondaryAccent: '#a4ac86',
    textColor: '#faf9f6',
  },
  {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    description: 'Crisp glacial slate and cool ice-blue highlights',
    baseColor: '#151c24',
    primaryAccent: '#4a6fa5',
    secondaryAccent: '#d4e4f7',
    textColor: '#fafafa',
  },
  {
    id: 'desert-rose',
    name: 'Desert Rose',
    description: 'Dusty terracotta rose and warm desert clay',
    baseColor: '#24181c',
    primaryAccent: '#d4a5a5',
    secondaryAccent: '#b87d6d',
    textColor: '#faf4ee',
  },
  {
    id: 'tech-innovation',
    name: 'Tech Innovation',
    description: 'High-contrast graphite and vibrant electric cobalt',
    baseColor: '#0d1117',
    primaryAccent: '#0066ff',
    secondaryAccent: '#00ffff',
    textColor: '#ffffff',
  },
  {
    id: 'botanical-garden',
    name: 'Botanical Garden',
    description: 'Deep natural botanical greens and marigold accents',
    baseColor: '#18231c',
    primaryAccent: '#f9a620',
    secondaryAccent: '#4a7c59',
    textColor: '#f5f3ed',
  },
  {
    id: 'sunset-boulevard',
    name: 'Sunset Boulevard',
    description: 'Twilight purple horizon and warm coral embers',
    baseColor: '#1c1e24',
    primaryAccent: '#e76f51',
    secondaryAccent: '#f4a261',
    textColor: '#fcf6ed',
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Architectural pure charcoal and disciplined silver',
    baseColor: '#121212',
    primaryAccent: '#d3d3d3',
    secondaryAccent: '#708090',
    textColor: '#ffffff',
  },
];

export function getThemeById(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function applyTheme(themeId: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themeId);
    try {
      localStorage.setItem('warden-theme', themeId);
    } catch (e) {
      // LocalStorage might fail in restricted iframe / sandbox
    }
  }
}
