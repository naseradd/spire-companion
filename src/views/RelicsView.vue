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

// ordre des sections par rareté (le 1er mot de "Uncommon Relic", etc.)
const ORDER = ['starter', 'common', 'uncommon', 'rare', 'ancient', 'boss', 'shop', 'special', 'event'];
const firstWord = (r: string) => r.toLowerCase().split(' ')[0];
const rank = (r: string) => { const i = ORDER.indexOf(firstWord(r)); return i < 0 ? 99 : i; };

const sections = computed(() => {
  const q = search.value.trim().toLowerCase();
  const kept = relics.filter((r) => (rarity.value === 'all' || r.rarity === rarity.value) && (!q || r.name.toLowerCase().includes(q) || plainText(r.description).toLowerCase().includes(q)));
  const byR = new Map<string, Relic[]>();
  for (const r of kept) (byR.get(r.rarity) ?? byR.set(r.rarity, []).get(r.rarity)!).push(r);
  return [...byR.entries()]
    .map(([rar, list]) => ({ rar, list: list.sort((a, b) => (relicScore(b.id)?.score ?? -1) - (relicScore(a.id)?.score ?? -1)) }))
    .sort((a, b) => rank(a.rar) - rank(b.rar) || a.rar.localeCompare(b.rar));
});
const total = computed(() => sections.value.reduce((n, s) => n + s.list.length, 0));
const tierOf = (r: Relic) => { const s = relicScore(r.id); return s && !isLowSample(s) ? scoreTier(s.score) : null; };
</script>

<template>
  <section class="view page">
    <span class="kicker">Compendium</span>
    <h1 class="page-title">Reliques</h1>
    <p class="lead">{{ relics.length }} reliques groupées par rareté, triées par win-impact. Survol = effet, clic = détail.</p>

    <div class="toolbar">
      <input v-model="search" class="field search" placeholder="Rechercher une relique…" />
      <select v-model="rarity" class="field"><option value="all">Toutes raretés</option><option v-for="r in rarities" :key="r" :value="r">{{ r }}</option></select>
      <span class="count">{{ total }}</span>
    </div>

    <Reveal v-for="(sec, i) in sections" :key="sec.rar" :index="i" tag="section" class="rsec">
      <h2 class="rsec-h">{{ sec.rar }} <span class="rsec-n">{{ sec.list.length }}</span></h2>
      <div class="grid">
        <button v-for="r in sec.list" :key="r.id" class="relic" :title="plainText(r.description)" @click="openRelic = r">
          <span class="ico"><CardImg kind="relics" :id="r.id" :image-url="r.image_url" :alt="r.name" /></span>
          <span class="name">{{ r.name }}</span>
          <span v-if="tierOf(r)" class="tier" :style="{ color: tierColor(tierOf(r)!) }">{{ tierOf(r) }}</span>
        </button>
      </div>
    </Reveal>

    <RelicModal :relic="openRelic" @close="openRelic = null" />
  </section>
</template>

<style scoped>
.page { max-width: 2000px; margin: 0 auto; padding: 28px clamp(28px, 4vw, 64px); }
.toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
.field { background: var(--canvas); border: 1px solid var(--hairline-2); border-radius: var(--r-sm); color: var(--ink); padding: 9px 12px; font-size: 14.5px; font-family: var(--font-body); }
.field:focus { outline: none; border-color: var(--accent-dim); box-shadow: 0 0 0 3px var(--accent-soft); }
.search { min-width: 240px; }
.count { color: var(--ink-3); font-size: 13.5px; margin-left: auto; }
.rsec { margin-bottom: 22px; }
.rsec-h { font-family: var(--font-display); font-weight: 700; font-size: 22px; color: var(--gold); margin: 0 0 12px; display: flex; align-items: baseline; gap: 10px; border-bottom: 1px solid var(--hairline); padding-bottom: 8px; }
.rsec-n { font-family: var(--font-body); font-size: 13px; color: var(--ink-4); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
.relic { display: flex; align-items: center; gap: 10px; background: var(--surface-2); border: 1px solid var(--hairline); border-radius: var(--r-sm); padding: 6px 11px 6px 6px; cursor: pointer; text-align: left; color: var(--ink); transition: background var(--t1) var(--ease), transform var(--t1) var(--ease), border-color var(--t1); }
.relic:hover { background: var(--raised-2); border-color: var(--gold-dim); transform: translateY(-1px); }
.relic:active { transform: scale(0.98); }
.ico { width: 38px; height: 38px; flex: 0 0 auto; border-radius: var(--r-xs); background: radial-gradient(circle at 50% 30%, var(--gold-soft), var(--surface)); border: 1px solid var(--hairline); display: grid; place-items: center; padding: 4px; }
.name { flex: 1; min-width: 0; font-size: 14px; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tier { flex: 0 0 auto; font-family: var(--font-black); font-size: 14px; }
</style>
