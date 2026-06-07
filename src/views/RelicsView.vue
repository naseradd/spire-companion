<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { relics, relicById, charById, PLAYABLE, normId, type Relic, type CharId } from '@/lib/data';
import { CHAR_META } from '@/lib/characters';
import { plainText } from '@/lib/bbcode';
import { relicScore } from '@/lib/tier';
import RelicCell from '@/components/RelicCell.vue';
import RelicModal from '@/components/RelicModal.vue';
import SegmentedControl from '@/components/ui/SegmentedControl.vue';
import Reveal from '@/components/ui/Reveal.vue';

const mode = ref<'rarity' | 'class' | 'impact'>((localStorage.getItem('sc.relicMode') as any) || 'rarity');
const search = ref('');
const rarity = ref('all');
const selChar = ref<CharId>('IRONCLAD');
const openRelic = ref<Relic | null>(null);

const rarities = [...new Set(relics.map((r) => r.rarity))].sort();
const modeOpts = [{ value: 'rarity', label: 'Par rareté' }, { value: 'class', label: 'Par classe' }, { value: 'impact', label: 'Win-impact' }];
const charAccent: Record<string, string> = { IRONCLAD: '#c0392b', SILENT: '#2fae73', DEFECT: '#3e78d4', REGENT: '#e0a52e', NECROBINDER: '#b5478c' };
watch(mode, (v) => localStorage.setItem('sc.relicMode', v));

const matchSearch = (r: Relic) => {
  const q = search.value.trim().toLowerCase();
  return !q || r.name.toLowerCase().includes(q) || plainText(r.description).toLowerCase().includes(q);
};
const byScore = (a: Relic, b: Relic) => (relicScore(b.id)?.score ?? -1) - (relicScore(a.id)?.score ?? -1);

/* — RARETÉ — */
const ORDER = ['starter', 'common', 'uncommon', 'rare', 'ancient', 'boss', 'shop', 'special', 'event'];
const rank = (r: string) => { const i = ORDER.indexOf(r.toLowerCase().split(' ')[0]); return i < 0 ? 99 : i; };
const sections = computed(() => {
  const kept = relics.filter((r) => (rarity.value === 'all' || r.rarity === rarity.value) && matchSearch(r));
  const byR = new Map<string, Relic[]>();
  for (const r of kept) (byR.get(r.rarity) ?? byR.set(r.rarity, []).get(r.rarity)!).push(r);
  return [...byR.entries()].map(([rar, list]) => ({ rar, list: list.sort(byScore) })).sort((a, b) => rank(a.rar) - rank(b.rar) || a.rar.localeCompare(b.rar));
});

/* — WIN-IMPACT — */
const flat = computed(() => relics.filter((r) => (rarity.value === 'all' || r.rarity === rarity.value) && matchSearch(r)).sort(byScore));

/* — CLASSE — (starters réels + synergies par thème) */
const starters = computed<Relic[]>(() => (charById.get(selChar.value)?.starting_relics ?? []).map((id) => relicById.get(normId(id))).filter(Boolean) as Relic[]);
const synergy = computed<Relic[]>(() => {
  const terms = CHAR_META[selChar.value].archetypes.flatMap((a) => a.terms);
  const starterIds = new Set(starters.value.map((r) => r.id));
  return relics
    .filter((r) => !starterIds.has(r.id) && matchSearch(r) && terms.some((t) => `${r.name} ${r.description}`.toLowerCase().includes(t)))
    .sort(byScore)
    .slice(0, 24);
});
</script>

<template>
  <section class="view page">
    <span class="kicker">Compendium</span>
    <h1 class="page-title">Reliques</h1>
    <p class="lead">{{ relics.length }} reliques. Survol = effet, clic = détail. Choisis l'angle : rareté, synergie de classe, ou pur win-impact.</p>

    <div class="toolbar">
      <SegmentedControl v-model="mode" :options="modeOpts" />
      <input v-model="search" class="field search" placeholder="Rechercher…" />
      <select v-if="mode !== 'class'" v-model="rarity" class="field"><option value="all">Toutes raretés</option><option v-for="r in rarities" :key="r" :value="r">{{ r }}</option></select>
    </div>

    <!-- PAR RARETÉ -->
    <template v-if="mode === 'rarity'">
      <Reveal v-for="(sec, i) in sections" :key="sec.rar" :index="i" tag="section" class="rsec">
        <h2 class="rsec-h">{{ sec.rar }} <span class="rsec-n">{{ sec.list.length }}</span></h2>
        <div class="grid"><RelicCell v-for="r in sec.list" :key="r.id" :relic="r" @open="openRelic = $event" /></div>
      </Reveal>
    </template>

    <!-- WIN-IMPACT -->
    <template v-else-if="mode === 'impact'">
      <p class="hint">{{ flat.length }} reliques classées par Codex Score décroissant.</p>
      <Reveal tag="div" class="grid"><RelicCell v-for="r in flat" :key="r.id" :relic="r" show-score @open="openRelic = $event" /></Reveal>
    </template>

    <!-- PAR CLASSE -->
    <template v-else>
      <div class="charchips">
        <button v-for="id in PLAYABLE" :key="id" class="cchip" :class="{ on: selChar === id }" :style="{ '--c': charAccent[id] }" @click="selChar = id">
          <span class="dot" />{{ id[0] + id.slice(1).toLowerCase() }}
        </button>
      </div>
      <Reveal tag="section" class="rsec" :data-char="selChar.toLowerCase()">
        <h2 class="rsec-h">Relique(s) de départ <span class="rsec-n">{{ starters.length }}</span></h2>
        <div class="grid"><RelicCell v-for="r in starters" :key="r.id" :relic="r" @open="openRelic = $event" /><span v-if="!starters.length" class="hint">—</span></div>
      </Reveal>
      <Reveal tag="section" class="rsec">
        <h2 class="rsec-h">Synergies {{ selChar[0] + selChar.slice(1).toLowerCase() }} <span class="rsec-n">{{ synergy.length }}</span></h2>
        <p class="hint">Reliques dont l'effet matche les axes de la classe, par win-impact.</p>
        <div class="grid"><RelicCell v-for="r in synergy" :key="r.id" :relic="r" show-score @open="openRelic = $event" /><span v-if="!synergy.length" class="hint">Aucune synergie évidente identifiée.</span></div>
      </Reveal>
    </template>

    <RelicModal :relic="openRelic" @close="openRelic = null" />
  </section>
</template>

<style scoped>
.page { max-width: 2000px; margin: 0 auto; padding: 28px clamp(28px, 4vw, 64px); }
.toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 22px; flex-wrap: wrap; }
.field { background: var(--canvas); border: 1px solid var(--hairline-2); border-radius: var(--r-sm); color: var(--ink); padding: 9px 12px; font-size: 14.5px; font-family: var(--font-body); }
.field:focus { outline: none; border-color: var(--accent-dim); box-shadow: 0 0 0 3px var(--accent-soft); }
.search { min-width: 220px; }
.hint { color: var(--ink-3); font-size: 13.5px; margin: 0 0 12px; }
.charchips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.cchip { display: inline-flex; align-items: center; gap: 8px; padding: 7px 15px; border-radius: var(--r-pill); background: var(--surface-2); border: 1px solid var(--hairline); color: var(--ink-2); cursor: pointer; font-size: 14px; transition: all var(--t1) var(--ease); }
.cchip .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px color-mix(in oklab, var(--c) 60%, transparent); }
.cchip:hover { color: var(--ink); border-color: var(--hairline-2); }
.cchip.on { color: var(--ink); background: color-mix(in oklab, var(--c) 16%, transparent); box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--c) 50%, transparent); }
.rsec { margin-bottom: 22px; }
.rsec-h { font-family: var(--font-display); font-weight: 700; font-size: 22px; color: var(--gold); margin: 0 0 12px; display: flex; align-items: baseline; gap: 10px; border-bottom: 1px solid var(--hairline); padding-bottom: 8px; }
.rsec-n { font-family: var(--font-body); font-size: 13px; color: var(--ink-4); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
</style>
