<script setup lang="ts">
import { computed, ref } from 'vue';
import { relics, type Relic } from '@/lib/data';
import { plainText } from '@/lib/bbcode';
import { relicScore, scoreTier, tierColor, isLowSample } from '@/lib/tier';
import CardImg from '@/components/ui/CardImg.vue';
import RelicModal from '@/components/RelicModal.vue';
import Reveal from '@/components/ui/Reveal.vue';

const search = ref('');
const rarity = ref('all');
const openRelic = ref<Relic | null>(null);
const rarities = [...new Set(relics.map((r) => r.rarity))].sort();

const rows = computed(() => {
  const q = search.value.trim().toLowerCase();
  return relics
    .filter((r) => (rarity.value === 'all' || r.rarity === rarity.value) && (!q || r.name.toLowerCase().includes(q) || plainText(r.description).toLowerCase().includes(q)))
    .map((r) => ({ r, s: relicScore(r.id) }))
    .sort((a, b) => (b.s?.score ?? -1) - (a.s?.score ?? -1));
});
const tierOf = (r: Relic) => { const s = relicScore(r.id); return s && !isLowSample(s) ? scoreTier(s.score) : null; };
</script>

<template>
  <section class="view page">
    <span class="kicker">Compendium</span>
    <h1 class="page-title">Reliques</h1>
    <p class="lead">{{ relics.length }} reliques triées par win-impact. Survol = effet, clic = détail complet. Repère les plus fortes d'un coup d'œil.</p>

    <div class="toolbar">
      <input v-model="search" class="field search" placeholder="Rechercher une relique…" />
      <select v-model="rarity" class="field"><option value="all">Toutes raretés</option><option v-for="r in rarities" :key="r" :value="r">{{ r }}</option></select>
      <span class="count">{{ rows.length }}</span>
    </div>

    <Reveal tag="div" class="grid">
      <button v-for="{ r } in rows" :key="r.id" class="relic" :title="plainText(r.description)" @click="openRelic = r">
        <span class="ico"><CardImg kind="relics" :id="r.id" :image-url="r.image_url" :alt="r.name" /></span>
        <span class="name">{{ r.name }}</span>
        <span v-if="tierOf(r)" class="tier" :style="{ color: tierColor(tierOf(r)!) }">{{ tierOf(r) }}</span>
      </button>
    </Reveal>

    <RelicModal :relic="openRelic" @close="openRelic = null" />
  </section>
</template>

<style scoped>
.page { max-width: 1240px; margin: 0 auto; padding: 28px; }
.toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
.field { background: var(--canvas); border: 1px solid var(--hairline-2); border-radius: var(--r-sm); color: var(--ink); padding: 9px 12px; font-size: 14.5px; font-family: var(--font-body); }
.field:focus { outline: none; border-color: var(--accent-dim); box-shadow: 0 0 0 3px var(--accent-soft); }
.search { min-width: 240px; }
.count { color: var(--ink-3); font-size: 13.5px; margin-left: auto; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px; }
.relic { display: flex; align-items: center; gap: 10px; background: var(--surface-2); border: 1px solid var(--hairline); border-radius: var(--r-sm); padding: 6px 11px 6px 6px; cursor: pointer; text-align: left; color: var(--ink); transition: background var(--t1) var(--ease), transform var(--t1) var(--ease), border-color var(--t1); }
.relic:hover { background: var(--raised-2); border-color: var(--gold-dim); transform: translateY(-1px); }
.relic:active { transform: scale(0.98); }
.ico { width: 38px; height: 38px; flex: 0 0 auto; border-radius: var(--r-xs); background: radial-gradient(circle at 50% 30%, var(--gold-soft), var(--surface)); border: 1px solid var(--hairline); display: grid; place-items: center; padding: 4px; }
.name { flex: 1; min-width: 0; font-size: 14px; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tier { flex: 0 0 auto; font-family: var(--font-black); font-size: 14px; }
</style>
