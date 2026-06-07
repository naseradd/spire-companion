// Détection de thèmes partagés pour suggérer les "bonnes choses associées".
export const THEMES = [
  'poison', 'strength', 'dexterity', 'block', 'exhaust', 'orb', 'channel', 'lightning', 'frost', 'dark',
  'plasma', 'focus', 'shiv', 'sly', 'retain', 'vulnerable', 'weak', 'soul', 'doom', 'summon', 'star',
  'forge', 'sovereign', 'intangible', 'thorns', 'draw', 'energy', 'wound', 'dazed', 'rage', 'metallicize',
];

export function themesOf(text: string): string[] {
  const t = text.toLowerCase();
  return THEMES.filter((x) => t.includes(x));
}
