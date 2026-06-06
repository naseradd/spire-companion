// Couche éditoriale (le "pourquoi" des builds). La data win-impact reste l'autorité ;
// ceci ajoute le contexte d'archétype. Daté/opinion, jamais en surcharge des chiffres.
import type { CharId } from '@/lib/data';

// `terms` = thèmes matchés sur les VRAIES cartes (nom/description/keywords) au lieu
// de noms en dur (qui rotent à chaque patch EA et donnent des cases vides).
export interface Archetype { name: string; blurb: string; terms: string[]; }
export interface CharMeta {
  id: CharId;
  slug: string;
  tagline: string;
  blurb: string;
  isNew?: boolean;
  archetypes: Archetype[];
}

export const CHAR_META: Record<CharId, CharMeta> = {
  IRONCLAD: {
    id: 'IRONCLAD', slug: 'ironclad', tagline: 'Force · Exhaust · Sang',
    blurb: "Le vétéran brutal : encaisse, sacrifie des PV, et frappe de plus en plus fort. Le plus pardonnant pour apprendre.",
    archetypes: [
      { name: 'Force', blurb: 'Empile la Force et démultiplie chaque attaque.', terms: ['strength'] },
      { name: 'Exhaust', blurb: 'Brûle tes cartes pour des bonus permanents et un deck affûté.', terms: ['exhaust'] },
      { name: 'Bloc / Body Slam', blurb: 'Convertis un bloc colossal en dégâts directs.', terms: ['block', 'body slam', 'barricade'] },
    ],
  },
  SILENT: {
    id: 'SILENT', slug: 'silent', tagline: 'Poison · Sly · Shivs',
    blurb: "L'assassine : tue lentement au poison ou enterre l'ennemi sous une nuée de dagues. Fragile, exige du tempo.",
    archetypes: [
      { name: 'Poison', blurb: 'Empoisonne tôt, scale, laisse le temps tuer.', terms: ['poison'] },
      { name: 'Shivs / Sly', blurb: 'Génère et démultiplie les Shivs via la défausse.', terms: ['shiv', 'sly'] },
      { name: 'Tempo / Défense', blurb: 'Survie infinie et scaling de bloc.', terms: ['block', 'retain', 'dexterity'] },
    ],
  },
  DEFECT: {
    id: 'DEFECT', slug: 'defect', tagline: 'Orbes · Focus · Frost',
    blurb: "L'automate : canalise des orbes (Foudre/Givre/Ténèbre/Plasma) et amplifie leur puissance. Le plus technique.",
    archetypes: [
      { name: 'Focus / Orbes', blurb: 'Monte le Focus, sature tes slots, laisse les orbes gagner.', terms: ['focus', 'orb', 'channel', 'lightning'] },
      { name: 'Frost / Bloc', blurb: 'Empile les orbes de Givre pour un mur infranchissable.', terms: ['frost', 'chill', 'block'] },
      { name: 'Zéro-coût / Claw', blurb: 'Spamme des cartes gratuites qui montent en puissance.', terms: ['claw', 'channel'] },
    ],
  },
  REGENT: {
    id: 'REGENT', slug: 'regent', tagline: 'Étoiles · Forge · Lame souveraine', isNew: true,
    blurb: "Nouveau. Gère une économie d'Étoiles et Forge la Lame Souveraine : le perso le plus build-committed, et le plus volatile en patch.",
    archetypes: [
      { name: 'Étoiles', blurb: 'Bâtis ton économie d\'Étoiles puis dépense en gros coups.', terms: ['star'] },
      { name: 'Forge / Lame souveraine', blurb: 'Forge et améliore la Lame Souveraine en arme de fin de run.', terms: ['forge', 'sovereign', 'blade'] },
    ],
  },
  NECROBINDER: {
    id: 'NECROBINDER', slug: 'necrobinder', tagline: 'Doom · Âmes · Invocations', isNew: true,
    blurb: "Nouveau. Plus bas PV de base, très dépendant des reliques, plafond le plus haut : cycle les Âmes, exécute au Doom, invoque l'Osty.",
    archetypes: [
      { name: 'Âmes / Cycle', blurb: 'Cycle les Âmes pour alimenter tes gros payoffs.', terms: ['soul'] },
      { name: 'Doom / Exécution', blurb: 'Marque puis exécute ; ignore les gros PV.', terms: ['doom', 'execute', 'death', 'reaping'] },
      { name: 'Invocations', blurb: 'Invoque et commande tes serviteurs.', terms: ['summon', 'minion', 'osty', 'bind'] },
    ],
  },
};

export const charMeta = (id: CharId) => CHAR_META[id];
