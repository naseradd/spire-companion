// Couche éditoriale (le "pourquoi" des builds). La data win-impact reste l'autorité ;
// ceci ajoute le contexte d'archétype. Daté/opinion, jamais en surcharge des chiffres.
import type { CharId } from '@/lib/data';

export interface Archetype { name: string; blurb: string; enablers: string[]; }
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
      { name: 'Force', blurb: 'Empile la Force et démultiplie chaque attaque.', enablers: ['Demon Form', 'Inflame', 'Limit Break', 'Heavy Blade', 'Spot Weakness'] },
      { name: 'Exhaust', blurb: 'Brûle tes cartes pour des bonus permanents et un deck affûté.', enablers: ['Corruption', 'Feel No Pain', 'Dark Embrace', 'Fiend Fire'] },
      { name: 'Bloc / Body Slam', blurb: 'Convertis un bloc colossal en dégâts directs.', enablers: ['Barricade', 'Body Slam', 'Entrench', 'Juggernaut'] },
    ],
  },
  SILENT: {
    id: 'SILENT', slug: 'silent', tagline: 'Poison · Sly · Shivs',
    blurb: "L'assassine : tue lentement au poison ou enterre l'ennemi sous une nuée de dagues. Fragile, exige du tempo.",
    archetypes: [
      { name: 'Poison', blurb: 'Empoisonne tôt, scale avec Catalyst, laisse le temps tuer.', enablers: ['Noxious Fumes', 'Catalyst', 'Bouncing Flask', 'Corpse Explosion'] },
      { name: 'Shivs / Sly', blurb: 'Génère et démultiplie les Shivs via la défausse.', enablers: ['Accuracy', 'Blade Dance', 'Cloak and Dagger', 'Storm of Steel'] },
      { name: 'Tempo / Défense', blurb: 'Survie infinie et scaling de bloc.', enablers: ['After Image', 'Footwork', 'Wraith Form', 'Tactician'] },
    ],
  },
  DEFECT: {
    id: 'DEFECT', slug: 'defect', tagline: 'Orbes · Focus · Frost',
    blurb: "L'automate : canalise des orbes (Foudre/Givre/Ténèbre/Plasma) et amplifie leur puissance. Le plus technique.",
    archetypes: [
      { name: 'Focus / Orbes', blurb: 'Monte le Focus, sature tes slots, laisse les orbes gagner.', enablers: ['Defragment', 'Biased Cognition', 'Electrodynamics', 'Echo Form'] },
      { name: 'Frost / Bloc', blurb: 'Empile les orbes de Givre pour un mur infranchissable.', enablers: ['Glacier', 'Coolheaded', 'Chill', 'Blizzard'] },
      { name: 'Zéro-coût / Claw', blurb: 'Spamme des cartes gratuites qui montent en puissance.', enablers: ['Claw', 'Hologram', 'All for One'] },
    ],
  },
  REGENT: {
    id: 'REGENT', slug: 'regent', tagline: 'Étoiles · Forge · Lame souveraine', isNew: true,
    blurb: "Nouveau. Gère une économie d'Étoiles et Forge la Lame Souveraine : le perso le plus build-committed, et le plus volatile en patch.",
    archetypes: [
      { name: 'Étoiles', blurb: 'Bâtis ton économie d\'Étoiles puis dépense en gros coups.', enablers: ['Big Bang', 'Bombardment', 'Supernova'] },
      { name: 'Forge / Lame souveraine', blurb: 'Forge et améliore la Lame Souveraine en arme de fin de run.', enablers: ['Forge', 'Sovereign Blade', 'Temper'] },
    ],
  },
  NECROBINDER: {
    id: 'NECROBINDER', slug: 'necrobinder', tagline: 'Doom · Âmes · Invocations', isNew: true,
    blurb: "Nouveau. Plus bas PV de base, très dépendant des reliques, plafond le plus haut : cycle les Âmes, exécute au Doom, invoque l'Osty.",
    archetypes: [
      { name: 'Âmes / Cycle', blurb: 'Cycle les Âmes pour alimenter tes gros payoffs.', enablers: ['Haunt', 'Graveblast', 'Soul Harvest'] },
      { name: 'Doom / Exécution', blurb: 'Marque puis exécute ; ignore les gros PV.', enablers: ['Doom', 'No Escape', 'Reaping'] },
      { name: 'Invocations', blurb: 'Invoque et commande l\'Osty et compagnie.', enablers: ['Summon Osty', 'Bind', 'Command'] },
    ],
  },
};

export const charMeta = (id: CharId) => CHAR_META[id];
