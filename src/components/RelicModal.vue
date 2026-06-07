<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue';
import type { Relic, Card } from '@/lib/data';
import { cards } from '@/lib/data';
import { renderBBCode } from '@/lib/bbcode';
import { themesOf } from '@/lib/themes';
import { relicScore, cardScore } from '@/lib/tier';
import CardImg from '@/components/ui/CardImg.vue';
import GameCard from '@/components/GameCard.vue';
import Badge from '@/components/ui/Badge.vue';
import ScoreMeter from '@/components/ui/ScoreMeter.vue';

const props = defineProps<{ relic: Relic | null }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'card', c: Card): void }>();
const score = computed(() => (props.relic ? relicScore(props.relic.id) : null));

// cartes qui profitent de la relique (thème partagé), par win-impact
const synergy = computed<Card[]>(() => {
  const r = props.relic;
  if (!r) return [];
  const th = themesOf(`${r.name} ${r.description}`);
  if (!th.length) return [];
  return cards
    .filter((c) => ['Attack', 'Skill', 'Power'].includes(c.type) && themesOf(`${c.name} ${c.description}`).some((t) => th.includes(t)))
    .sort((a, b) => (cardScore(b.id)?.score ?? -1) - (cardScore(a.id)?.score ?? -1))
    .slice(0, 6);
});
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close'); }
watch(() => props.relic, (r) => { if (r) window.addEventListener('keydown', onKey); else window.removeEventListener('keydown', onKey); });
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <Transition name="cm">
      <div v-if="relic" class="backdrop" @click.self="$emit('close')">
        <div class="modal" role="dialog" aria-modal="true">
          <button class="x" aria-label="Fermer" @click="$emit('close')">✕</button>
          <div class="head">
            <span class="ico"><CardImg kind="relics" :id="relic.id" :image-url="relic.image_url" :alt="relic.name" /></span>
            <div><h2 class="title">{{ relic.name }}</h2><Badge>{{ relic.rarity }}</Badge></div>
          </div>
          <p class="desc" v-html="renderBBCode(relic.description)" />
          <p v-if="relic.flavor" class="flavor">« {{ relic.flavor }} »</p>
          <div class="score"><span class="kicker">Win-impact</span><ScoreMeter :score="score" /></div>
          <div v-if="synergy.length" class="synergy">
            <span class="kicker">Cartes qui en profitent</span>
            <div class="syn-grid">
              <GameCard v-for="s in synergy" :key="s.id" :card="s" mini @open="emit('card', $event)" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; z-index: 1000; background: rgba(7,6,9,.7); backdrop-filter: blur(5px); display: grid; place-items: center; padding: 24px; }
.modal { position: relative; max-width: 440px; width: 100%; background: linear-gradient(180deg, var(--raised), var(--surface)); border: 1px solid var(--hairline-2); border-radius: var(--r-lg); box-shadow: var(--shadow-lg); padding: 22px 24px; }
.x { position: absolute; top: 12px; right: 12px; background: rgba(11,10,13,.6); border: 1px solid var(--hairline); color: var(--ink-2); width: 30px; height: 30px; border-radius: var(--r-sm); cursor: pointer; }
.x:hover { color: var(--ink); }
.head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.ico { width: 60px; height: 60px; flex: 0 0 auto; border-radius: var(--r-sm); background: radial-gradient(circle at 50% 30%, var(--gold-soft), var(--surface-2)); border: 1px solid var(--hairline-2); display: grid; place-items: center; padding: 6px; }
.title { font-family: var(--font-display); font-weight: 700; font-size: 27px; margin: 0 0 6px; line-height: 1.05; }
.desc { font-size: 16px; line-height: 1.6; color: var(--ink); margin: 0 0 12px; }
.desc :deep(.kw) { color: var(--gold-hi); font-weight: 600; font-style: normal; }
.flavor { font-style: italic; color: var(--ink-3); font-size: 14px; margin: 0 0 14px; }
.score { border-top: 1px solid var(--hairline); padding-top: 14px; }
.score .kicker { display: block; margin-bottom: 8px; }
.synergy { border-top: 1px solid var(--hairline); padding-top: 14px; margin-top: 14px; }
.synergy .kicker { display: block; margin-bottom: 10px; }
.syn-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 8px; }
.cm-enter-active { transition: opacity var(--t2) var(--ease); } .cm-enter-active .modal { transition: transform var(--t2) var(--ease-out-expo); }
.cm-leave-active { transition: opacity .14s; } .cm-enter-from { opacity: 0; } .cm-enter-from .modal { transform: translateY(14px) scale(.98); }
</style>
