# Spire Codex Companion — Slay the Spire 2

Companion web pour **Slay the Spire 2** (Early Access). Tier lists data-driven par personnage (win-impact), builds/archétypes, base de cartes et reliques — **assets réels du jeu**. Aide à décider vite pendant un run : quoi prendre, quoi éviter.

## Commandes
```bash
npm install
npm run ingest        # télécharge data + images réelles depuis spire-codex.com (à relancer pour MAJ patch)
npm run ingest -- --no-img   # data seule (rapide)
npm run dev
npm run build         # DOIT passer
npm run type-check    # DOIT passer
```
⚠️ Les images (`public/cards|relics|potions|characters`) sont **gitignored** (© Mega Crit, non redistribuées) → lancer `npm run ingest` après un clone.

## Stack
Vite · Vue 3 (`<script setup lang="ts">`) · Pinia · vue-router · **GSAP + Lenis** (hero cinématique uniquement) · **CSS pur + design tokens** dans `src/style.css`. Pas de Tailwind/lib UI.

## Données — Spire Codex
Source unique : **spire-codex.com** (API publique FastAPI, dataminée du jeu, CORS). Ingérée au build dans `src/data/*.json` (bundlé, offline-fiable, zéro appel runtime). 
- `cards/characters/relics/potions/keywords/events.json` — contenu réel.
- `ratings.json` — **win-impact** : `{score 0-100 "Codex Score", picks, wins, win_rate}` par carte, **par personnage** (`ratings.cards.IRONCLAD`…) + `overall`. Source des tiers.
- `meta.json` — date d'ingest + changelog. Images : `cdn`/`/static/images/...` → téléchargées dans `/public/<kind>/<id>.<ext>` ; fallback hotlink `spire-codex.com` (cf. `CardImg.vue`).

5 persos : **Ironclad, Silent, Defect + Necrobinder & Regent** (Watcher absent en EA).

## Architecture
```
src/
  style.css            # tokens "gothic occult manuscript" + per-character accents [data-char]
  lib/
    data.ts            # JSON typé + maps + imgLocal/imgRemote + colorToChar
    tier.ts            # scoreTier, rankTiers (tiers par RANG, pyramide S/A/B/C/D), confidence
    bbcode.ts          # rend le BBCode Godot ([gold]…[/gold]) en HTML
    characters.ts      # couche éditoriale : tagline + archétypes (enablers) par perso
    format.ts
  components/
    GameCard.vue       # CARTE au format du jeu (cadre classe + orbe coût + bannière + médaillon art réel + desc + verdict pick/skip)
    CardModal.vue      # détail carte + win-impact par perso
    AppHeader.vue
    ui/                # Reveal, SegmentedControl, Badge, Spinner, TierLetter, ScoreMeter, DataTable, CardImg
  views/
    HubView            # hero cinématique "ascension de la Spire" (GSAP/Lenis) + galerie classes + top cartes
    CardsView          # explorateur (galerie GameCard / table) + filtres
    CharacterView      # /c/:slug — tier list (zones À PRENDRE/SITUATIONNEL/À ÉVITER) + Builds (verdict pick + pièges) + deck départ ; set l'accent
    RelicsView · GlossaryView
```

## Conventions / garde-fous
- **Tiers = par rang** (`rankTiers`), jamais seuil absolu (le score sature à 100). Toujours afficher le sample (picks) ; griser/exclure les faibles échantillons.
- **Assets réels obligatoires** : `GameCard`/`CardImg` affichent l'art réel (local→fallback hotlink). Ne jamais ripper/redistribuer ; disclaimer Mega Crit dans le footer.
- Tout le contenu vient du JSON bundlé (pas d'appel API runtime). MAJ = `npm run ingest`.
- Motion : courbes ease-out, scroll-reveal sobre, hero cinématique isolé, `prefers-reduced-motion` respecté.
- Early Access : data volatile → badge daté, ne pas présenter les tiers comme figés.

## Référence
Design distinct de l'app EFT (tactique olive) : ici **gothique-occulte** (charcoal-aubergine, or enluminé, accent-joyau par classe, serif Cormorant/Spectral, blackletter Pirata One).
