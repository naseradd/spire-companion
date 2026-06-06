<script setup lang="ts">
import { computed } from 'vue';
import type { Card } from '@/lib/data';
import { renderBBCode } from '@/lib/bbcode';
import { cardScore, scoreTier, isLowSample, tierColor, type Tier } from '@/lib/tier';
import CardImg from '@/components/ui/CardImg.vue';

const props = defineProps<{ card: Card; char?: string; tier?: Tier | null; verdict?: 'pick' | 'skip' | 'meh' | null }>();
defineEmits<{ (e: 'open', c: Card): void }>();

const verdictLabel: Record<string, string> = { pick: 'À prendre', skip: 'À éviter', meh: 'Situationnel' };

// couleur de cadre par classe (comme les vraies cartes du jeu)
const FRAME: Record<string, string> = {
  ironclad: '#b8392c', silent: '#2f9e63', defect: '#3a6fc4', regent: '#d09a2e', necrobinder: '#b0468a',
  colorless: '#8a8494', curse: '#6f54a8', status: '#5f6f7d', quest: '#c9a24b',
};
const cc = computed(() => FRAME[props.card.color] ?? '#8a8494');
const cost = computed(() => (props.card.cost != null ? String(props.card.cost) : props.card.is_x_cost ? 'X' : ''));

const score = computed(() => cardScore(props.card.id, props.char));
const tier = computed<Tier | null>(() => (props.tier ? props.tier : score.value && !isLowSample(score.value) ? scoreTier(score.value.score) : null));
</script>

<template>
  <button class="gc" :class="verdict ? 'v-' + verdict : ''" :style="{ '--cc': cc }" @click="$emit('open', card)" :title="card.name">
    <!-- orbe de coût -->
    <span v-if="cost" class="gc-cost">{{ cost }}</span>
    <span v-if="tier" class="gc-tier" :style="{ color: tierColor(tier), borderColor: tierColor(tier) }">{{ tier }}</span>

    <!-- bannière du nom -->
    <span class="gc-banner"><span class="gc-name">{{ card.name }}</span></span>

    <!-- médaillon d'art -->
    <span class="gc-art"><CardImg kind="cards" :id="card.id" :image-url="card.image_url" :alt="card.name" /></span>

    <!-- pastille de type -->
    <span class="gc-type">{{ card.type }}</span>

    <!-- panneau de description -->
    <span class="gc-text"><span class="gc-desc" v-html="renderBBCode(card.description)" /></span>

    <!-- verdict de draft -->
    <span v-if="verdict" class="gc-verdict">{{ verdict === 'pick' ? '✓' : verdict === 'skip' ? '✕' : '~' }} {{ verdictLabel[verdict] }}</span>
  </button>
</template>

<style scoped>
.gc {
  --cc: #8a8494;
  position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;
  width: 100%; height: 100%; min-height: 248px; padding: 13px 10px 12px; overflow: visible; border-radius: 16px;
  background:
    radial-gradient(120% 80% at 50% 6%, color-mix(in oklab, var(--cc) 42%, #16121a), color-mix(in oklab, var(--cc) 18%, #110e16) 70%),
    #110e16;
  border: 3px solid color-mix(in oklab, var(--cc) 78%, #000);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 2px 10px rgba(0, 0, 0, 0.5), var(--shadow-sm);
  transition: transform var(--t1) var(--ease-out-quart), box-shadow var(--t2), filter var(--t1);
}
.gc:hover { transform: translateY(-6px); box-shadow: var(--shadow-md), 0 0 30px color-mix(in oklab, var(--cc) 36%, transparent); filter: saturate(1.08); }
.gc:active { transform: translateY(-1px) scale(0.99); }

/* orbe de coût (haut gauche, déborde) */
.gc-cost {
  position: absolute; top: -8px; left: -8px; z-index: 4; width: 30px; height: 30px; border-radius: 50%;
  display: grid; place-items: center; font-family: var(--font-display); font-weight: 700; font-size: 17px; color: #fff;
  background: radial-gradient(circle at 36% 28%, color-mix(in oklab, var(--cc) 60%, #fff 8%), color-mix(in oklab, var(--cc) 70%, #000));
  border: 2px solid #e9cf7e; box-shadow: 0 0 0 1px rgba(0,0,0,.5), 0 2px 6px rgba(0,0,0,.6), inset 0 1px 2px rgba(255,255,255,.4);
  text-shadow: 0 1px 2px rgba(0,0,0,.7);
}
.gc-tier { position: absolute; top: -6px; right: -6px; z-index: 4; width: 24px; height: 24px; display: grid; place-items: center; font-family: var(--font-black); font-size: 14px; border: 1.5px solid; border-radius: 7px; background: rgba(11,10,13,.85); }

/* bannière dorée */
.gc-banner {
  position: relative; z-index: 3; width: 96%; min-height: 22px; margin-bottom: 6px; display: grid; place-items: center; padding: 2px 14px;
  background: linear-gradient(180deg, #f1d987, #c79a3c 55%, #9c7526);
  border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,.5), inset 0 1px 1px rgba(255,255,255,.5);
  clip-path: polygon(4% 0, 96% 0, 100% 50%, 96% 100%, 4% 100%, 0 50%);
}
.gc-name { font-family: var(--font-display); font-weight: 700; font-size: clamp(13px, 1.05vw, 16px); line-height: 1.05; color: #2a1c08; text-shadow: 0 1px 0 rgba(255,255,255,.25); }

/* médaillon ovale d'art */
.gc-art {
  position: relative; width: 80%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; flex: 0 0 auto;
  background: radial-gradient(circle at 50% 35%, color-mix(in oklab, var(--cc) 22%, #000), #08070b);
  border: 3px solid #d8b863; box-shadow: 0 0 0 1px rgba(0,0,0,.6), inset 0 0 14px rgba(0,0,0,.7);
}
.gc-art :deep(.cimg) { width: 100%; height: 100%; }
.gc-art :deep(.cimg img) { object-fit: cover; transform: scale(1.08); }

/* pastille de type */
.gc-type {
  position: relative; z-index: 3; margin: -10px 0 0; padding: 2px 12px; border-radius: var(--r-pill);
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: var(--ink);
  background: #0d0b12; border: 1px solid color-mix(in oklab, var(--cc) 50%, #000);
}

/* panneau description */
.gc-text { flex: 1; width: 100%; margin-top: 7px; display: grid; place-items: center; padding: 9px 9px; overflow: visible;
  background: linear-gradient(180deg, rgba(0,0,0,.22), rgba(0,0,0,.4)); border-radius: 9px; box-shadow: inset 0 1px 4px rgba(0,0,0,.45); }
.gc-desc { font-size: 12.5px; line-height: 1.36; color: #ece6f2; text-align: center; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
.gc-desc :deep(.kw) { color: #f0c863; font-style: normal; font-weight: 600; }

/* verdict de draft */
.gc-verdict { width: 100%; margin-top: 7px; padding: 4px 6px; border-radius: var(--r-sm); font-family: var(--font-body); font-weight: 700; font-size: 11.5px; letter-spacing: 0.5px; text-transform: uppercase; text-align: center; }
.v-pick { border-color: color-mix(in oklab, var(--good) 70%, #000); box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), 0 0 22px color-mix(in oklab, var(--good) 22%, transparent), var(--shadow-sm); }
.v-pick .gc-verdict { background: color-mix(in oklab, var(--good) 22%, transparent); color: var(--good); }
.v-skip { border-color: color-mix(in oklab, var(--bad) 70%, #000); opacity: 0.82; }
.v-skip .gc-verdict { background: color-mix(in oklab, var(--bad) 20%, transparent); color: #ef7d6e; }
.v-skip .gc-art { filter: grayscale(0.35); }
.v-meh .gc-verdict { background: color-mix(in oklab, var(--warn) 18%, transparent); color: var(--warn); }
</style>
