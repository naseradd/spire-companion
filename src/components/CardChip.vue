<script setup lang="ts">
import { computed } from 'vue';
import type { Card } from '@/lib/data';
import { cardScore, scoreTier, isLowSample, tierColor, type Tier } from '@/lib/tier';

const props = defineProps<{ card: Card; char?: string; tier?: Tier | null }>();
defineEmits<{ (e: 'open', c: Card): void }>();

const score = computed(() => cardScore(props.card.id, props.char));
const tier = computed<Tier | null>(() => (props.tier ? props.tier : score.value && !isLowSample(score.value) ? scoreTier(score.value.score) : null));
const cost = computed(() => (props.card.cost != null ? String(props.card.cost) : props.card.is_x_cost ? 'X' : '·'));
</script>

<template>
  <button class="chip" @click="$emit('open', card)" :title="card.name">
    <span class="cost">{{ cost }}</span>
    <span class="name">{{ card.name }}</span>
    <span v-if="tier" class="tier" :style="{ color: tierColor(tier) }">{{ tier }}</span>
  </button>
</template>

<style scoped>
.chip {
  display: flex; align-items: center; gap: 7px; width: 100%; cursor: pointer; text-align: left;
  background: var(--surface-2); border: 1px solid var(--hairline); border-radius: var(--r-sm);
  padding: 4px 8px 4px 4px; color: var(--ink); transition: background var(--t1) var(--ease), transform var(--t1) var(--ease), border-color var(--t1);
}
.chip:hover { background: var(--raised-2); border-color: var(--hairline-2); transform: translateX(2px); }
.chip:active { transform: scale(0.98); }
.cost { flex: 0 0 auto; width: 19px; height: 19px; border-radius: 50%; display: grid; place-items: center; font-family: var(--font-display); font-weight: 700; font-size: 12px; color: var(--gold-hi); background: radial-gradient(circle at 38% 28%, #2a2740, #0b0a12); border: 1px solid var(--gold-dim); }
.name { flex: 1; min-width: 0; font-size: 13px; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tier { flex: 0 0 auto; font-family: var(--font-black); font-size: 12.5px; }
</style>
