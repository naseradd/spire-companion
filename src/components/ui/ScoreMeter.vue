<script setup lang="ts">
import { computed } from 'vue';
import type { Score } from '@/lib/data';
import { scoreTier, tierColor, confidence } from '@/lib/tier';
import { compact, pct } from '@/lib/format';

const props = defineProps<{ score: Score | null }>();
const tier = computed(() => (props.score ? scoreTier(props.score.score) : null));
const conf = computed(() => confidence(props.score));
</script>
<template>
  <div class="sm" :class="'conf-' + conf">
    <div v-if="score" class="track" :title="`Codex Score ${score.score}/100 · ${pct(score.win_rate)} winrate · ${compact(score.picks)} runs`">
      <span class="fill" :style="{ width: Math.min(100, score.score) + '%', background: tier ? tierColor(tier) : 'var(--ink-3)' }" />
    </div>
    <div class="meta num" v-if="score">
      <b :style="{ color: tier ? tierColor(tier) : 'var(--ink-3)' }">{{ score.score }}</b>
      <span class="wr">{{ pct(score.win_rate) }}</span>
      <span class="pk" :title="compact(score.picks) + ' runs'">{{ compact(score.picks) }}</span>
    </div>
    <span v-else class="none">—</span>
  </div>
</template>
<style scoped>
.sm { display: flex; align-items: center; gap: 10px; min-width: 150px; }
.track { flex: 1; height: 6px; background: var(--canvas); border-radius: var(--r-pill); overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,.4); }
.fill { display: block; height: 100%; border-radius: var(--r-pill); transition: width 0.6s var(--ease-out-expo); }
.meta { display: flex; align-items: baseline; gap: 8px; font-variant-numeric: tabular-nums; }
.meta b { font-size: 15px; }
.wr { font-size: 12.5px; color: var(--ink-2); }
.pk { font-size: 11px; color: var(--ink-4); }
.conf-low { opacity: 0.5; }
.conf-low .pk::after { content: ' ⚠'; }
.none { color: var(--ink-4); }
</style>
