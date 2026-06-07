<script setup lang="ts">
import { computed, ref } from 'vue';
import { cards, type Card } from '@/lib/data';
import { plainText } from '@/lib/bbcode';
import { cardScore, rankTiers } from '@/lib/tier';
import GameCard from '@/components/GameCard.vue';
import CardModal from '@/components/CardModal.vue';
import DataTable, { type Column } from '@/components/ui/DataTable.vue';
import SegmentedControl from '@/components/ui/SegmentedControl.vue';
import CardImg from '@/components/ui/CardImg.vue';
import ScoreMeter from '@/components/ui/ScoreMeter.vue';
import Reveal from '@/components/ui/Reveal.vue';

const search = ref('');
const color = ref('all');
const type = ref('all');
const rarity = ref('all');
const view = ref<'gallery' | 'table'>('gallery');
const openCard = ref<Card | null>(null);
const open = (r: any) => { openCard.value = r as Card; };

const COLORS = [
  { value: 'all', label: 'Toutes' }, { value: 'ironclad', label: 'Ironclad' }, { value: 'silent', label: 'Silent' },
  { value: 'defect', label: 'Defect' }, { value: 'regent', label: 'Regent' }, { value: 'necrobinder', label: 'Necrobinder' },
  { value: 'colorless', label: 'Incolore' }, { value: 'curse', label: 'Malédiction' },
];
const types = [...new Set(cards.map((c) => c.type))].sort();
const rarities = [...new Set(cards.map((c) => c.rarity))].sort();

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return cards.filter((c) => {
    if (color.value !== 'all' && c.color !== color.value) return false;
    if (type.value !== 'all' && c.type !== type.value) return false;
    if (rarity.value !== 'all' && c.rarity !== rarity.value) return false;
    if (q && !(c.name.toLowerCase().includes(q) || plainText(c.description).toLowerCase().includes(q))) return false;
    return true;
  });
});

const rankMap = computed(() => rankTiers(filtered.value.map((c) => ({ id: c.id, s: cardScore(c.id) }))));
const rows = computed(() =>
  filtered.value.map((c) => ({ ...c, sc: cardScore(c.id)?.score ?? -1, scoreObj: cardScore(c.id), costN: c.cost ?? 99 })),
);
const cols: Column[] = [
  { key: 'name', label: 'Carte', sortable: false },
  { key: 'color', label: 'Classe' },
  { key: 'type', label: 'Type' },
  { key: 'rarity', label: 'Rareté' },
  { key: 'costN', label: 'Coût', align: 'right' },
  { key: 'sc', label: 'Codex Score', align: 'left' },
];
const viewOpts = [{ value: 'gallery', label: 'Galerie' }, { value: 'table', label: 'Table' }];
</script>

<template>
  <section class="view page">
    <span class="kicker">Compendium</span>
    <h1 class="page-title">Toutes les cartes</h1>
    <p class="lead">{{ cards.length }} cartes réelles de Slay the Spire 2, notées par win-impact. Filtre, compare, ouvre le détail.</p>

    <div class="toolbar">
      <input v-model="search" class="field search" placeholder="Rechercher une carte…" />
      <select v-model="type" class="field"><option value="all">Tous types</option><option v-for="t in types" :key="t" :value="t">{{ t }}</option></select>
      <select v-model="rarity" class="field"><option value="all">Toutes raretés</option><option v-for="r in rarities" :key="r" :value="r">{{ r }}</option></select>
      <div class="spacer" />
      <SegmentedControl v-model="view" :options="viewOpts" size="sm" />
    </div>

    <div class="colorchips">
      <button v-for="c in COLORS" :key="c.value" class="chip" :class="{ on: color === c.value }" @click="color = c.value">{{ c.label }}</button>
    </div>

    <p class="count">{{ filtered.length }} carte{{ filtered.length > 1 ? 's' : '' }}</p>

    <Reveal v-if="view === 'gallery'" tag="div" class="grid">
      <GameCard v-for="c in filtered" :key="c.id" :card="c" :tier="rankMap.get(c.id)" @open="openCard = $event" />
    </Reveal>

    <DataTable v-else :columns="cols" :rows="rows" initial-key="sc" :initial-dir="-1">
      <template #cell-name="{ row }">
        <button class="namecell" @click="open(row)">
          <span class="thumb"><CardImg kind="cards" :id="row.id" :image-url="row.image_url" :alt="row.name" /></span>
          <span>{{ row.name }}</span>
        </button>
      </template>
      <template #cell-color="{ row }"><span class="cap">{{ row.color }}</span></template>
      <template #cell-costN="{ row }">{{ row.cost ?? (row.is_x_cost ? 'X' : '—') }}</template>
      <template #cell-sc="{ row }"><ScoreMeter :score="row.scoreObj" /></template>
    </DataTable>

    <CardModal :card="openCard" @close="openCard = null" @open="openCard = $event" />
  </section>
</template>

<style scoped>
.page { max-width: 2000px; margin: 0 auto; padding: 28px clamp(28px, 4vw, 64px); }
.toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 12px; }
.field { background: var(--canvas); border: 1px solid var(--hairline-2); border-radius: var(--r-sm); color: var(--ink); padding: 9px 12px; font-size: 14.5px; font-family: var(--font-body); }
.field:focus { outline: none; border-color: var(--accent-dim); box-shadow: 0 0 0 3px var(--accent-soft); }
.search { min-width: 240px; flex: 0 1 auto; }
.spacer { flex: 1; }
.colorchips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.chip { font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--ink-2); background: var(--surface-2); border: 1px solid var(--hairline); border-radius: var(--r-pill); padding: 7px 15px; cursor: pointer; }
.chip:hover { border-color: var(--hairline-2); color: var(--ink); }
.chip.on { background: var(--gold); color: var(--ink-on-gold); border-color: var(--gold); font-weight: 600; box-shadow: var(--shadow-gold); }
.count { color: var(--ink-3); font-size: 13.5px; margin: 0 0 14px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 16px; }
.namecell { display: flex; align-items: center; gap: 11px; background: none; border: none; color: var(--ink); cursor: pointer; font-size: 15px; font-family: var(--font-display); font-weight: 600; text-align: left; }
.namecell:hover { color: var(--gold); }
.thumb { width: 40px; height: 40px; flex: 0 0 auto; border-radius: var(--r-xs); overflow: hidden; background: var(--surface-2); border: 1px solid var(--hairline); }
.cap { text-transform: capitalize; color: var(--ink-2); }
</style>
