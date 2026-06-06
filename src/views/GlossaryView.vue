<script setup lang="ts">
import { keywords } from '@/lib/data';
import { renderBBCode } from '@/lib/bbcode';
import Reveal from '@/components/ui/Reveal.vue';
import Badge from '@/components/ui/Badge.vue';

// Couche éditoriale : nouveaux systèmes StS2 que la muscle-memory StS1 rate (recherche).
const systems = [
  { name: 'Ancients & Blessings', tag: 'Remplace les reliques de boss', body: "Au DÉBUT de chaque acte, un Ancient (PNJ patron) propose une Blessing qui réécrit les règles (tours bonus, formes de carte, récompenses cross-couleur). Neow ouvre le run. Plus de choix de relique de boss après le boss." },
  { name: 'Afflictions', tag: 'Remplace les malédictions', body: "Les ennemis corrompent désormais TES cartes existantes (ex : +1 énergie, limite de cartes par tour) au lieu d'ajouter des malédictions. On ne les retire pas aussi simplement qu'au marchand." },
  { name: 'Enchantments', tag: 'Modificateurs permanents', body: "Modificateurs de carte sur tout le run (texte violet), gagnés en événement : pur bonus (Replay = joue 2×) ou risque/récompense (Corrupted = +50% dégâts, -3 PV/jeu)." },
  { name: 'Quest Cards', tag: 'Cartes injouables → récompense', body: "Cartes Unplayable qui se transforment en gain une fois une condition remplie (ex : Byrdonis Egg éclôt en repos → Byrd Swoop). Un pari sur un slot de deck." },
  { name: 'Alternate Acts', tag: 'Biomes variables', body: "Chaque acte peut rouler l'un de deux biomes (Acte 1 : Overgrowth forêt OU Underdocks port), changeant tout le pool d'ennemis/events/boss — donc le routing." },
  { name: 'Ascension (10)', tag: 'Difficulté compressée', body: "10 niveaux d'Ascension (vs 20 en StS1), paliers plus marqués. Pistes solo (par perso) et co-op (partagée) séparées et non transférables." },
  { name: 'Durability & Wax', tag: 'Reliques qui s\'usent', body: "Nouvelles reliques à Durability (s'épuisent dans les longs combats) et reliques Wax (fondent tous les 3 combats). Réévalue les passifs « permanents »." },
  { name: 'Co-op (4 joueurs)', tag: 'Multijoueur', body: "Jusqu'à 4 joueurs partagent un run (HP ennemis scalés, cartes co-op). Invitation Steam entre amis uniquement, pas de matchmaking public." },
];
</script>

<template>
  <section class="view page">
    <span class="kicker">Apprendre</span>
    <h1 class="page-title">Systèmes & mots-clés</h1>
    <p class="lead">Ce que la mémoire de Slay the Spire 1 te fait rater dans la suite. Les nouveaux systèmes, puis les mots-clés du jeu.</p>

    <h2 class="section-title">Nouveaux systèmes StS2</h2>
    <div class="sysgrid">
      <Reveal v-for="(s, i) in systems" :key="s.name" :index="i % 4">
        <article class="sys">
          <div class="sys-top"><h3 class="sys-name">{{ s.name }}</h3><Badge variant="accent">{{ s.tag }}</Badge></div>
          <p class="sys-body">{{ s.body }}</p>
        </article>
      </Reveal>
    </div>

    <hr class="filigree" />

    <h2 class="section-title">Mots-clés</h2>
    <div class="kwgrid">
      <Reveal v-for="(k, i) in keywords" :key="k.id" :index="i % 4">
        <article class="kw">
          <h3 class="kw-name">{{ k.name }}</h3>
          <p class="kw-body" v-html="renderBBCode(k.description)" />
        </article>
      </Reveal>
    </div>
  </section>
</template>

<style scoped>
.page { max-width: 1180px; margin: 0 auto; padding: 28px; }
.sysgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 14px; }
.sys { background: linear-gradient(180deg, var(--raised), var(--surface)); border: 1px solid var(--hairline); border-radius: var(--r-md); padding: 18px 20px; height: 100%; box-shadow: var(--shadow-sm); }
.sys-top { display: flex; align-items: center; gap: 10px; justify-content: space-between; margin-bottom: 9px; flex-wrap: wrap; }
.sys-name { font-family: var(--font-display); font-weight: 700; font-size: 24px; margin: 0; color: var(--gold); }
.sys-body { font-size: 15px; color: var(--ink-2); line-height: 1.6; margin: 0; }
.kwgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.kw { background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--r-sm); padding: 14px 16px; }
.kw-name { font-family: var(--font-display); font-weight: 600; font-size: 19px; margin: 0 0 5px; }
.kw-body { font-size: 14px; color: var(--ink-2); line-height: 1.5; margin: 0; }
.kw-body :deep(.kw) { color: var(--gold-hi); font-weight: 600; }
</style>
