<script setup lang="ts">
import { computed, ref } from 'vue';
import { relics } from '@/lib/data';
import { renderBBCode, plainText } from '@/lib/bbcode';
import { relicScore } from '@/lib/tier';
import CardImg from '@/components/ui/CardImg.vue';
import Badge from '@/components/ui/Badge.vue';
import ScoreMeter from '@/components/ui/ScoreMeter.vue';
import Reveal from '@/components/ui/Reveal.vue';

const search = ref('');
const rarity = ref('all');
const rarities = [...new Set(relics.map((r) => r.rarity))].sort();

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return relics
    .filter((r) => (rarity.value === 'all' || r.rarity === rarity.value) && (!q || r.name.toLowerCase().includes(q) || plainText(r.description).toLowerCase().includes(q)))
    .map((r) => ({ r, s: relicScore(r.id) }))
    .sort((a, b) => (b.s?.score ?? -1) - (a.s?.score ?? -1));
});
const rarityColor = (r: string) => `var(--r-${r.toLowerCase()}, var(--ink-3))`;
</script>

<template>
  <section class="view page">
    <span class="kicker">Compendium</span>
    <h1 class="page-title">Reliques</h1>
    <p class="lead">{{ relics.length }} reliques réelles, triées par win-impact. Méfie-toi des reliques-pièges et des effets de Durability.</p>

    <div class="toolbar">
      <input v-model="search" class="field search" placeholder="Rechercher une relique…" />
      <select v-model="rarity" class="field"><option value="all">Toutes raretés</option><option v-for="r in rarities" :key="r" :value="r">{{ r }}</option></select>
      <span class="count">{{ filtered.length }}</span>
    </div>

    <Reveal tag="div" class="grid">
      <article v-for="{ r, s } in filtered" :key="r.id" class="relic" :style="{ '--rc': rarityColor(r.rarity) }">
        <div class="rtop">
          <span class="ricon"><CardImg kind="relics" :id="r.id" :image-url="r.image_url" :alt="r.name" /></span>
          <div class="rhead">
            <h3 class="rname">{{ r.name }}</h3>
            <Badge :color="rarityColor(r.rarity)">{{ r.rarity }}</Badge>
          </div>
        </div>
        <p class="rdesc" v-html="renderBBCode(r.description)" />
        <div class="rscore"><ScoreMeter :score="s" /></div>
      </article>
    </Reveal>
  </section>
</template>

<style scoped>
.page { max-width: 1240px; margin: 0 auto; padding: 28px; }
.toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
.field { background: var(--canvas); border: 1px solid var(--hairline-2); border-radius: var(--r-sm); color: var(--ink); padding: 9px 12px; font-size: 14.5px; font-family: var(--font-body); }
.field:focus { outline: none; border-color: var(--accent-dim); box-shadow: 0 0 0 3px var(--accent-soft); }
.search { min-width: 240px; }
.count { color: var(--ink-3); font-size: 13.5px; margin-left: auto; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.relic { background: linear-gradient(180deg, var(--raised), var(--surface)); border: 1px solid var(--hairline); border-radius: var(--r-md); padding: 16px; box-shadow: var(--shadow-sm); transition: transform var(--t1) var(--ease-out-quart), border-color var(--t1); }
.relic:hover { transform: translateY(-2px); border-color: color-mix(in oklab, var(--rc) 50%, var(--hairline-2)); }
.rtop { display: flex; align-items: center; gap: 13px; margin-bottom: 12px; }
.ricon { width: 52px; height: 52px; flex: 0 0 auto; border-radius: var(--r-sm); background: radial-gradient(circle at 50% 30%, color-mix(in oklab, var(--rc) 22%, var(--surface-2)), var(--surface-2)); border: 1px solid var(--hairline); display: grid; place-items: center; padding: 5px; }
.rhead { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.rname { font-family: var(--font-display); font-weight: 700; font-size: 21px; margin: 0; line-height: 1.05; }
.rdesc { font-size: 14.5px; color: var(--ink-2); line-height: 1.55; margin: 0 0 14px; min-height: 44px; }
.rdesc :deep(.kw) { color: var(--gold-hi); font-style: normal; font-weight: 600; }
.rscore { border-top: 1px solid var(--hairline); padding-top: 12px; }
</style>
