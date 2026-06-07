// Data bundlée (ingérée depuis spire-codex.com via `npm run ingest`).
import cardsJson from '@/data/cards.json';
import charactersJson from '@/data/characters.json';
import relicsJson from '@/data/relics.json';
import potionsJson from '@/data/potions.json';
import keywordsJson from '@/data/keywords.json';
import ratingsJson from '@/data/ratings.json';
import metaJson from '@/data/meta.json';

export type CharId = 'IRONCLAD' | 'SILENT' | 'DEFECT' | 'NECROBINDER' | 'REGENT';

export interface Card {
  id: string;
  name: string;
  description: string;
  cost: number | null;
  is_x_cost: boolean | null;
  type: string; // Attack | Skill | Power | Curse | Status | Quest
  rarity: string;
  target: string | null;
  color: string; // ironclad | silent | defect | regent | necrobinder | colorless | curse | status | ...
  damage: number | null;
  block: number | null;
  keywords: string[] | null;
  tags: string[] | null;
  upgrade: Record<string, string> | null;
  upgrade_description: string | null;
  image_url: string;
  compendium_order: number;
}

export interface Character {
  id: CharId;
  name: string;
  description: string;
  starting_hp: number;
  starting_gold: number;
  max_energy: number;
  orb_slots: number;
  starting_deck: string[];
  starting_relics: string[];
  unlocks_after: string | null;
  gender: string;
  color: string;
  image_url: string;
  quotes?: Record<string, string>;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  rarity: string;
  character: string | null;
  flavor: string | null;
  image_url: string;
}

export interface Potion { id: string; name: string; description?: string; rarity?: string; image_url: string; [k: string]: unknown; }
export interface Keyword { id: string; name: string; description: string; }
export interface Score { score: number; picks: number; wins: number; win_rate: number; }
export interface Ratings { cards: Record<string, Record<string, Score>>; relics: Record<string, Record<string, Score>>; }
export interface Meta {
  patch: string; patchDate: string | null; ingestedAt: string; source: string;
  recentChanges: { version: string; date: string; title: string; summary?: { added: number; removed: number; changed: number } }[];
  counts: Record<string, number>;
}

export const cards = cardsJson as Card[];
export const characters = charactersJson as Character[];
export const relics = relicsJson as Relic[];
export const potions = potionsJson as Potion[];
export const keywords = keywordsJson as Keyword[];
export const ratings = ratingsJson as Ratings;
export const meta = metaJson as Meta;

export const cardById = new Map(cards.map((c) => [c.id, c]));
export const relicById = new Map(relics.map((r) => [r.id, r]));
export const charById = new Map(characters.map((c) => [c.id, c]));

export const PLAYABLE: CharId[] = ['IRONCLAD', 'SILENT', 'DEFECT', 'REGENT', 'NECROBINDER'];

/** Couleur (color field) -> CharId pour les cartes de classe. */
export function colorToChar(color: string): CharId | null {
  const c = color.toLowerCase();
  return (['ironclad', 'silent', 'defect', 'regent', 'necrobinder'].includes(c) ? (c.toUpperCase() as CharId) : null);
}

/** Chemin image local (téléchargé) ; fallback distant via image_url. */
export function imgLocal(kind: 'cards' | 'relics' | 'potions' | 'characters', id: string, image_url: string): string {
  const ext = image_url.endsWith('.png') ? '.png' : '.webp';
  return `/${kind}/${id.toLowerCase()}${ext}`;
}
export function imgRemote(image_url: string): string {
  return 'https://spire-codex.com' + image_url;
}

/** Normalise un id PascalCase (starting_deck/relics) -> UPPER_SNAKE (ids cards/relics). */
export function normId(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toUpperCase();
}
