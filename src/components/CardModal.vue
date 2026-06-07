<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue';
import type { Card } from '@/lib/data';
import { PLAYABLE, colorToChar, cards } from '@/lib/data';
import { renderBBCode } from '@/lib/bbcode';
import { themesOf } from '@/lib/themes';
import { cardScore } from '@/lib/tier';
import CardImg from '@/components/ui/CardImg.vue';
import GameCard from '@/components/GameCard.vue';
import Badge from '@/components/ui/Badge.vue';
import ScoreMeter from '@/components/ui/ScoreMeter.vue';

const props = defineProps<{ card: Card | null }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'open', c: Card): void }>();

// "bonnes choses associées" : cartes de même classe partageant un thème, par win-impact
const synergy = computed<Card[]>(() => {
  const c = props.card;
  if (!c) return [];
  const th = themesOf(`${c.name} ${c.description}`);
  if (!th.length) return [];
  const ch = ownerChar.value || undefined;
  return cards
    .filter((x) => x.id !== c.id && (x.color === c.color || x.color === 'colorless') && ['Attack', 'Skill', 'Power'].includes(x.type) && themesOf(`${x.name} ${x.description}`).some((t) => th.includes(t)))
    .sort((a, b) => (cardScore(b.id, ch)?.score ?? -1) - (cardScore(a.id, ch)?.score ?? -1))
    .slice(0, 6);
});

const ownerChar = computed(() => (props.card ? colorToChar(props.card.color) : null));
const statRows = computed(() => {
  if (!props.card) return [];
  const rows = [{ label: 'Global', score: cardScore(props.card.id) }];
  // si carte de classe, montre le score dans le contexte de sa classe ; sinon tous persos
  if (ownerChar.value) rows.push({ label: ownerChar.value, score: cardScore(props.card.id, ownerChar.value) });
  else for (const ch of PLAYABLE) rows.push({ label: ch, score: cardScore(props.card.id, ch) });
  return rows;
});
const rarityColor = computed(() => (props.card ? `var(--r-${props.card.rarity.toLowerCase()}, var(--ink-3))` : ''));

function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close'); }
watch(() => props.card, (c) => { if (c) window.addEventListener('keydown', onKey); else window.removeEventListener('keydown', onKey); });
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <Transition name="cm">
      <div v-if="card" class="backdrop" @click.self="$emit('close')">
        <div class="modal" role="dialog" aria-modal="true">
          <button class="x" aria-label="Fermer" @click="$emit('close')">✕</button>
          <div class="art" :style="{ '--rc': rarityColor }">
            <CardImg kind="cards" :id="card.id" :image-url="card.image_url" :alt="card.name" />
          </div>
          <div class="body">
            <div class="head">
              <h2 class="title">{{ card.name }}</h2>
              <div class="tags">
                <Badge :color="rarityColor">{{ card.rarity }}</Badge>
                <Badge>{{ card.type }}</Badge>
                <Badge v-if="card.cost != null">{{ card.cost }} énergie</Badge>
                <Badge v-else-if="card.is_x_cost">X énergie</Badge>
                <Badge v-for="k in card.keywords || []" :key="k" variant="accent">{{ k }}</Badge>
              </div>
            </div>
            <p class="desc" v-html="renderBBCode(card.description)" />
            <div v-if="card.upgrade_description && card.upgrade_description !== card.description" class="upg">
              <span class="upg-k">Améliorée +</span>
              <p v-html="renderBBCode(card.upgrade_description)" />
            </div>
            <div class="scores">
              <span class="kicker">Win-impact (Codex Score)</span>
              <div v-for="r in statRows" :key="r.label" class="srow">
                <span class="slab">{{ r.label === 'Global' ? 'Global' : r.label[0] + r.label.slice(1).toLowerCase() }}</span>
                <ScoreMeter :score="r.score" />
              </div>
            </div>
            <div v-if="synergy.length" class="synergy">
              <span class="kicker">Synergies</span>
              <div class="syn-grid">
                <GameCard v-for="s in synergy" :key="s.id" :card="s" :char="ownerChar || undefined" mini @open="emit('open', $event)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; z-index: 1000; background: rgba(7, 6, 9, 0.7); backdrop-filter: blur(5px); display: grid; place-items: center; padding: 24px; }
.modal { position: relative; display: grid; grid-template-columns: 300px 1fr; gap: 0; max-width: 760px; width: 100%; background: linear-gradient(180deg, var(--raised), var(--surface)); border: 1px solid var(--hairline-2); border-radius: var(--r-lg); box-shadow: var(--shadow-lg); overflow: hidden; }
.x { position: absolute; top: 12px; right: 12px; z-index: 3; background: rgba(11,10,13,.6); border: 1px solid var(--hairline); color: var(--ink-2); width: 30px; height: 30px; border-radius: var(--r-sm); cursor: pointer; }
.x:hover { color: var(--ink); border-color: var(--hairline-2); }
.art { background: radial-gradient(120% 100% at 50% 0%, color-mix(in oklab, var(--rc) 22%, var(--surface-2)), var(--canvas)); padding: 24px; display: grid; place-items: center; }
.art :deep(.cimg) { max-width: 240px; }
.body { padding: 22px 24px; overflow-y: auto; max-height: 80vh; }
.title { font-family: var(--font-display); font-weight: 700; font-size: 30px; margin: 0 0 10px; line-height: 1.05; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.desc { font-size: 16px; line-height: 1.6; color: var(--ink); margin: 0 0 14px; }
.desc :deep(.kw), .upg :deep(.kw) { color: var(--gold-hi); font-style: normal; font-weight: 600; }
.upg { border-top: 1px solid var(--hairline); padding-top: 12px; margin-bottom: 16px; }
.upg-k { font-family: var(--font-body); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--good); }
.upg p { margin: 4px 0 0; color: var(--ink-2); font-size: 15px; }
.scores { border-top: 1px solid var(--hairline); padding-top: 14px; }
.scores .kicker { margin-bottom: 10px; }
.srow { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
.slab { width: 88px; flex: 0 0 auto; font-size: 13px; color: var(--ink-2); }
.synergy { border-top: 1px solid var(--hairline); padding-top: 14px; margin-top: 16px; }
.synergy .kicker { display: block; margin-bottom: 10px; }
.syn-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(94px, 1fr)); gap: 8px; }
.cm-enter-active { transition: opacity var(--t2) var(--ease); }
.cm-enter-active .modal { transition: transform var(--t2) var(--ease-out-expo); }
.cm-leave-active { transition: opacity 0.14s; }
.cm-enter-from { opacity: 0; }
.cm-enter-from .modal { transform: translateY(14px) scale(0.98); }
@media (max-width: 680px) { .modal { grid-template-columns: 1fr; } .art :deep(.cimg) { max-width: 180px; } }
</style>
