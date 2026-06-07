<script setup lang="ts">
import { computed } from 'vue';
import type { Relic } from '@/lib/data';
import { plainText } from '@/lib/bbcode';
import { relicScore, scoreTier, tierColor, isLowSample } from '@/lib/tier';
import CardImg from '@/components/ui/CardImg.vue';

const props = defineProps<{ relic: Relic; showScore?: boolean }>();
defineEmits<{ (e: 'open', r: Relic): void }>();

const s = computed(() => relicScore(props.relic.id));
const tier = computed(() => (s.value && !isLowSample(s.value) ? scoreTier(s.value.score) : null));
</script>

<template>
  <button class="relic" :title="plainText(relic.description)" @click="$emit('open', relic)">
    <span class="ico"><CardImg kind="relics" :id="relic.id" :image-url="relic.image_url" :alt="relic.name" /></span>
    <span class="name">{{ relic.name }}</span>
    <span v-if="showScore && s" class="sc num">{{ s.score }}</span>
    <span v-if="tier" class="tier" :style="{ color: tierColor(tier) }">{{ tier }}</span>
  </button>
</template>

<style scoped>
.relic { display: flex; align-items: center; gap: 10px; background: var(--surface-2); border: 1px solid var(--hairline); border-radius: var(--r-sm); padding: 6px 11px 6px 6px; cursor: pointer; text-align: left; color: var(--ink); transition: background var(--t1) var(--ease), transform var(--t1) var(--ease), border-color var(--t1); width: 100%; }
.relic:hover { background: var(--raised-2); border-color: var(--gold-dim); transform: translateY(-1px); }
.relic:active { transform: scale(0.98); }
.ico { width: 38px; height: 38px; flex: 0 0 auto; border-radius: var(--r-xs); background: radial-gradient(circle at 50% 30%, var(--gold-soft), var(--surface)); border: 1px solid var(--hairline); display: grid; place-items: center; padding: 4px; }
.name { flex: 1; min-width: 0; font-size: 14px; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sc { flex: 0 0 auto; font-size: 12px; color: var(--ink-3); }
.tier { flex: 0 0 auto; font-family: var(--font-black); font-size: 14px; }
</style>
