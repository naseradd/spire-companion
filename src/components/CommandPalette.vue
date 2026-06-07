<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { cards, relics, type Card, type Relic } from '@/lib/data';
import { plainText } from '@/lib/bbcode';
import { cardScore, relicScore, scoreTier, isLowSample, tierColor } from '@/lib/tier';
import CardImg from '@/components/ui/CardImg.vue';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'card', c: Card): void; (e: 'relic', r: Relic): void }>();

interface Entry { kind: 'card' | 'relic'; id: string; name: string; sub: string; image_url: string; tier: string | null; score: number }
const index: Entry[] = [
  ...cards.map((c) => { const s = cardScore(c.id); return { kind: 'card' as const, id: c.id, name: c.name, sub: `${c.type} · ${c.rarity}`, image_url: c.image_url, tier: s && !isLowSample(s) ? scoreTier(s.score) : null, score: s?.score ?? -1, _t: (c.name + ' ' + plainText(c.description)).toLowerCase() }; }),
  ...relics.map((r) => { const s = relicScore(r.id); return { kind: 'relic' as const, id: r.id, name: r.name, sub: r.rarity, image_url: r.image_url, tier: s && !isLowSample(s) ? scoreTier(s.score) : null, score: s?.score ?? -1, _t: (r.name + ' ' + plainText(r.description)).toLowerCase() }; }),
] as (Entry & { _t: string })[];

const query = ref('');
const active = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);
const listEl = ref<HTMLElement | null>(null);

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  return (index as (Entry & { _t: string })[])
    .filter((e) => e._t.includes(q))
    .sort((a, b) => Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q)) || b.score - a.score)
    .slice(0, 40);
});

function close() { emit('update:modelValue', false); }
function pick(e: Entry) {
  if (e.kind === 'card') { const c = cards.find((x) => x.id === e.id); if (c) emit('card', c); }
  else { const r = relics.find((x) => x.id === e.id); if (r) emit('relic', r); }
  close();
}
function onKey(ev: KeyboardEvent) {
  if (ev.key === 'Escape') return close();
  if (ev.key === 'ArrowDown') { ev.preventDefault(); active.value = Math.min(results.value.length - 1, active.value + 1); scroll(); }
  else if (ev.key === 'ArrowUp') { ev.preventDefault(); active.value = Math.max(0, active.value - 1); scroll(); }
  else if (ev.key === 'Enter') { ev.preventDefault(); const e = results.value[active.value]; if (e) pick(e); }
}
async function scroll() { await nextTick(); listEl.value?.querySelector<HTMLElement>('.row.active')?.scrollIntoView({ block: 'nearest' }); }
watch(query, () => { active.value = 0; });
watch(() => props.modelValue, async (o) => { if (o) { query.value = ''; active.value = 0; await nextTick(); inputEl.value?.focus(); } });
</script>

<template>
  <Teleport to="body">
    <Transition name="cmd">
      <div v-if="modelValue" class="backdrop" @click.self="close" @keydown="onKey">
        <div class="palette" role="dialog" aria-modal="true">
          <div class="search">
            <span class="s-ic">⌕</span>
            <input ref="inputEl" v-model="query" placeholder="Chercher une carte ou une relique…" aria-label="Recherche" />
            <kbd>esc</kbd>
          </div>
          <div ref="listEl" class="list">
            <p v-if="!query" class="hint">Tape pour chercher. ↑↓ pour naviguer, ⏎ pour ouvrir.</p>
            <p v-else-if="!results.length" class="hint">Aucun résultat pour « {{ query }} ».</p>
            <button v-for="(e, i) in results" :key="e.kind + e.id" class="row" :class="{ active: i === active }" @click="pick(e)" @mousemove="active = i">
              <span class="thumb" :class="e.kind"><CardImg :kind="e.kind === 'card' ? 'cards' : 'relics'" :id="e.id" :image-url="e.image_url" :alt="e.name" /></span>
              <span class="r-main"><span class="r-name">{{ e.name }}</span><span class="r-sub">{{ e.sub }}</span></span>
              <span v-if="e.tier" class="r-tier" :style="{ color: tierColor(e.tier as any) }">{{ e.tier }}</span>
              <span class="r-kind">{{ e.kind === 'card' ? 'Carte' : 'Relique' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; z-index: 1100; background: rgba(7,6,9,.6); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: flex-start; padding: 11vh 24px 24px; }
.palette { width: 100%; max-width: 620px; background: linear-gradient(180deg, var(--raised), var(--surface)); border: 1px solid var(--hairline-2); border-radius: var(--r-lg); box-shadow: var(--shadow-lg); overflow: hidden; }
.search { display: flex; align-items: center; gap: 11px; padding: 15px 18px; border-bottom: 1px solid var(--hairline); }
.s-ic { color: var(--ink-3); font-size: 18px; }
.search input { flex: 1; background: transparent; border: none; color: var(--ink); font-size: 17px; font-family: var(--font-body); }
.search input:focus { outline: none; }
.search input::placeholder { color: var(--ink-3); }
.search kbd { font-family: var(--font-body); font-size: 11px; color: var(--ink-3); border: 1px solid var(--hairline-2); border-radius: var(--r-xs); padding: 2px 7px; }
.list { max-height: 58vh; overflow-y: auto; padding: 8px; }
.hint { color: var(--ink-3); font-size: 14px; text-align: center; padding: 26px 16px; margin: 0; }
.row { width: 100%; display: flex; align-items: center; gap: 12px; background: transparent; border: none; border-radius: var(--r-sm); padding: 8px 11px; cursor: pointer; text-align: left; transition: background var(--t1) var(--ease); }
.row.active { background: var(--surface-2); }
.thumb { width: 36px; height: 36px; flex: 0 0 auto; border-radius: var(--r-xs); overflow: hidden; background: var(--surface-2); border: 1px solid var(--hairline); display: grid; place-items: center; padding: 2px; }
.thumb.relic { background: radial-gradient(circle at 50% 30%, var(--gold-soft), var(--surface-2)); }
.r-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.r-name { font-family: var(--font-display); font-weight: 600; font-size: 16px; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.r-sub { font-size: 12px; color: var(--ink-3); }
.r-tier { font-family: var(--font-black); font-size: 15px; }
.r-kind { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--ink-4); border: 1px solid var(--hairline); border-radius: var(--r-xs); padding: 2px 7px; }
.cmd-enter-active { transition: opacity var(--t2) var(--ease); } .cmd-enter-active .palette { transition: transform var(--t2) var(--ease-out-expo); }
.cmd-leave-active { transition: opacity .12s; } .cmd-enter-from { opacity: 0; } .cmd-enter-from .palette { transform: translateY(-12px) scale(.98); }
</style>
