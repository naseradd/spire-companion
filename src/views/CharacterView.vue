<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { cards, relics, charById, cardById, relicById, colorToChar, type Card, type Relic, type CharId } from '@/lib/data';
import { CHAR_META } from '@/lib/characters';
import { cardScore, relicScore, rankTiers, TIERS, tierColor, type Tier } from '@/lib/tier';
import { plainText } from '@/lib/bbcode';
import CardImg from '@/components/ui/CardImg.vue';
import GameCard from '@/components/GameCard.vue';
import CardModal from '@/components/CardModal.vue';
import RelicModal from '@/components/RelicModal.vue';
import TierLetter from '@/components/ui/TierLetter.vue';
import SegmentedControl from '@/components/ui/SegmentedControl.vue';
import Reveal from '@/components/ui/Reveal.vue';
import Badge from '@/components/ui/Badge.vue';

const route = useRoute();
const charId = computed<CharId | null>(() => {
  const slug = route.params.slug as string;
  return (Object.values(CHAR_META).find((m) => m.slug === slug)?.id as CharId) ?? null;
});
const meta = computed(() => (charId.value ? CHAR_META[charId.value] : null));
const character = computed(() => (charId.value ? charById.get(charId.value) : null));
const openCard = ref<Card | null>(null);
const tab = ref<'tiers' | 'builds'>('tiers');

function applyAccent(id: CharId | null) {
  if (id) document.documentElement.dataset.char = id.toLowerCase();
  else delete document.documentElement.dataset.char;
}
onMounted(() => applyAccent(charId.value));
watch(charId, (id) => applyAccent(id));
onBeforeUnmount(() => applyAccent(null));

// cartes pertinentes : classe + incolore, types jouables
const pool = computed<Card[]>(() => {
  const id = charId.value;
  if (!id) return [];
  return cards.filter((c) => (colorToChar(c.color) === id || c.color === 'colorless') && ['Attack', 'Skill', 'Power'].includes(c.type));
});

interface Lane { tier: Tier; cards: Card[]; }
const rankMap = computed(() => rankTiers(pool.value.map((c) => ({ id: c.id, s: cardScore(c.id, charId.value || undefined) }))));
const lanes = computed<Lane[]>(() => {
  const id = charId.value!;
  const out: Record<Tier, Card[]> = { S: [], A: [], B: [], C: [], D: [] };
  for (const c of pool.value) { const t = rankMap.value.get(c.id); if (t) out[t].push(c); }
  const sc = (cid: string) => cardScore(cid, id);
  for (const t of TIERS) out[t].sort((a, b) => (sc(b.id)?.score ?? 0) - (sc(a.id)?.score ?? 0) || (sc(b.id)?.picks ?? 0) - (sc(a.id)?.picks ?? 0));
  return TIERS.map((t) => ({ tier: t, cards: out[t] }));
});
const lowSample = computed<Card[]>(() => pool.value.filter((c) => !rankMap.value.has(c.id)).slice(0, 24));

// zones de draft + pièges (pour décider vite pendant un run)
const ZONE: Record<Tier, { label: string; cls: string }> = {
  S: { label: 'À prendre', cls: 'z-pick' }, A: { label: 'À prendre', cls: 'z-pick' },
  B: { label: 'Situationnel', cls: 'z-meh' }, C: { label: 'À éviter', cls: 'z-skip' }, D: { label: 'À éviter', cls: 'z-skip' },
};
const traps = computed<Card[]>(() => (lanes.value.find((l) => l.tier === 'D')?.cards ?? []).slice(0, 10));

const startDeck = computed(() => (character.value?.starting_deck ?? []).map((id) => cardById.get(id)).filter(Boolean) as Card[]);
const startRelics = computed(() => (character.value?.starting_relics ?? []).map((id) => relicById.get(id)).filter(Boolean));

// builds DATA-DRIVEN : matche les vraies cartes de la classe par thème (terms),
// triées par win-impact. Plus de noms en dur → plus de cases vides.
function archetypeCards(terms: string[]): Card[] {
  const id = charId.value!;
  return pool.value
    .filter((c) => {
      const hay = `${c.name} ${c.description} ${(c.keywords || []).join(' ')} ${(c.tags || []).join(' ')}`.toLowerCase();
      return terms.some((t) => hay.includes(t));
    })
    .sort((a, b) => (cardScore(b.id, id)?.score ?? -1) - (cardScore(a.id, id)?.score ?? -1))
    .slice(0, 12);
}
// verdict RELATIF à l'archétype (cs déjà trié par score décroissant) :
// top 40% = à prendre, 40-70% = ok, reste = à éviter.
function groupByVerdict(cs: Card[]) {
  const g: Record<'pick' | 'meh' | 'skip', Card[]> = { pick: [], meh: [], skip: [] };
  const n = cs.length || 1;
  cs.forEach((c, i) => {
    const p = (i + 0.5) / n;
    g[p < 0.4 ? 'pick' : p < 0.7 ? 'meh' : 'skip'].push(c);
  });
  return g;
}
const buildRows = computed(() => (meta.value?.archetypes ?? []).map((a) => {
  const cs = archetypeCards(a.terms);
  const g = groupByVerdict(cs);
  const vmap = new Map<string, 'pick' | 'meh' | 'skip'>();
  (['pick', 'meh', 'skip'] as const).forEach((k) => g[k].forEach((c) => vmap.set(c.id, k)));
  return { name: a.name, blurb: a.blurb, cards: cs, g, vmap };
}));
const buildView = ref<'compact' | 'detail'>((localStorage.getItem('sc.buildView') as 'compact' | 'detail') || 'compact');
watch(buildView, (v) => localStorage.setItem('sc.buildView', v));
const buildViewOpts = [{ value: 'compact', label: 'Plan de draft' }, { value: 'detail', label: 'Détaillé' }];

// reliques pertinentes : thème (description ↔ termes d'archétype) puis top win-impact
const openRelic = ref<Relic | null>(null);
const buildRelics = computed<Relic[]>(() => {
  const m = meta.value;
  if (!m) return [];
  const terms = m.archetypes.flatMap((a) => a.terms);
  const scored = relics.map((r) => ({ r, s: relicScore(r.id)?.score ?? -1, hay: `${r.name} ${r.description}`.toLowerCase() })).filter((x) => x.s >= 0);
  const themed = [...scored].filter((x) => terms.some((t) => x.hay.includes(t))).sort((a, b) => b.s - a.s);
  const top = [...scored].sort((a, b) => b.s - a.s);
  const out: Relic[] = [];
  const seen = new Set<string>();
  for (const x of [...themed, ...top]) { if (seen.has(x.r.id)) continue; seen.add(x.r.id); out.push(x.r); if (out.length >= 14) break; }
  return out;
});

const tabOpts = [{ value: 'tiers', label: 'Tier list' }, { value: 'builds', label: 'Builds' }];
const accent = computed(() => (charId.value ? `var(--accent)` : 'var(--gold)'));
</script>

<template>
  <section v-if="meta && character" class="view page">
    <!-- HERO perso -->
    <header class="chero">
      <div class="cportrait"><CardImg kind="characters" :id="meta.id" :image-url="character.image_url" :alt="meta.id" /></div>
      <div class="cmeta">
        <span class="kicker">{{ meta.tagline }}</span>
        <h1 class="cname">{{ meta.id[0] + meta.id.slice(1).toLowerCase() }}<Badge v-if="meta.isNew" variant="accent" style="margin-left:12px;vertical-align:middle">Nouveau</Badge></h1>
        <p class="cblurb">{{ meta.blurb }}</p>
        <div class="cstats">
          <span class="stat"><b class="num" :style="{ color: accent }">{{ character.starting_hp }}</b> PV</span>
          <span class="stat"><b class="num" :style="{ color: accent }">{{ character.max_energy }}</b> énergie</span>
          <span class="stat"><b class="num" :style="{ color: accent }">{{ character.starting_gold }}</b> or</span>
          <span v-if="character.orb_slots" class="stat"><b class="num" :style="{ color: accent }">{{ character.orb_slots }}</b> orbes</span>
        </div>
        <div class="startrow">
          <div class="startgrp">
            <span class="sk">Deck de départ</span>
            <div class="thumbs">
              <button v-for="(c, i) in startDeck" :key="i" class="sthumb" @click="openCard = c" :title="c.name"><CardImg kind="cards" :id="c.id" :image-url="c.image_url" :alt="c.name" /></button>
            </div>
          </div>
          <div v-if="startRelics.length" class="startgrp">
            <span class="sk">Relique</span>
            <div class="thumbs">
              <span v-for="r in startRelics" :key="r!.id" class="sthumb relic" :title="r!.name"><CardImg kind="relics" :id="r!.id" :image-url="r!.image_url" :alt="r!.name" /></span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="tabbar"><SegmentedControl v-model="tab" :options="tabOpts" /></div>

    <!-- TIER LIST -->
    <div v-if="tab === 'tiers'">
      <p class="note">Notes par <b>win-impact</b> (Codex Score) sur les runs {{ meta.id[0] + meta.id.slice(1).toLowerCase() }}. Échantillon faible = exclu des tiers (voir bas). Early Access : la méta bouge à chaque patch.</p>
      <Reveal v-for="(lane, i) in lanes" :key="lane.tier" :index="i" tag="div" class="lane" :class="{ empty: !lane.cards.length }">
        <div class="lane-rail" :style="{ background: tierColor(lane.tier) }" />
        <div class="lane-head">
          <TierLetter :tier="lane.tier" :size="50" />
          <span class="zone" :class="ZONE[lane.tier].cls">{{ ZONE[lane.tier].label }}</span>
        </div>
        <div class="lane-cards">
          <GameCard v-for="c in lane.cards" :key="c.id" :card="c" :char="charId!" :tier="rankMap.get(c.id)" @open="openCard = $event" />
          <span v-if="!lane.cards.length" class="lane-none">—</span>
        </div>
      </Reveal>
      <details v-if="lowSample.length" class="lowsample">
        <summary>Données insuffisantes ({{ lowSample.length }}) — cartes peu jouées, notes non fiables</summary>
        <div class="grid">
          <GameCard v-for="c in lowSample" :key="c.id" :card="c" :char="charId!" @open="openCard = $event" />
        </div>
      </details>
    </div>

    <!-- BUILDS -->
    <div v-else class="builds">
      <div class="build-toolbar">
        <p class="note">Par axe : ce qu'il faut <b>prendre</b>, ce qui est <b>ok</b>, ce qu'il faut <b>éviter</b>. Clique une carte pour le détail.</p>
        <SegmentedControl v-model="buildView" :options="buildViewOpts" size="sm" />
      </div>

      <!-- PLAN DE DRAFT : 3 colonnes, tout visible sans scroller -->
      <template v-if="buildView === 'compact'">
        <Reveal v-for="(a, i) in buildRows" :key="a.name" :index="i" tag="div">
          <article class="cboard">
            <div class="cb-head"><h3 class="build-name">{{ a.name }}</h3><span class="cb-blurb">{{ a.blurb }}</span></div>
            <div class="ccols">
              <div class="ccol pick">
                <span class="ccol-h">✓ À prendre <i>{{ a.g.pick.length }}</i></span>
                <div class="col-cards">
                  <GameCard v-for="c in a.g.pick" :key="c.id" :card="c" :char="charId!" :tier="rankMap.get(c.id)" mini @open="openCard = $event" />
                  <span v-if="!a.g.pick.length" class="ccol-empty">—</span>
                </div>
              </div>
              <div class="ccol meh">
                <span class="ccol-h">~ OK <i>{{ a.g.meh.length }}</i></span>
                <div class="col-cards">
                  <GameCard v-for="c in a.g.meh" :key="c.id" :card="c" :char="charId!" :tier="rankMap.get(c.id)" mini @open="openCard = $event" />
                  <span v-if="!a.g.meh.length" class="ccol-empty">—</span>
                </div>
              </div>
              <div class="ccol skip">
                <span class="ccol-h">✕ À éviter <i>{{ a.g.skip.length }}</i></span>
                <div class="col-cards">
                  <GameCard v-for="c in a.g.skip" :key="c.id" :card="c" :char="charId!" :tier="rankMap.get(c.id)" mini @open="openCard = $event" />
                  <span v-if="!a.g.skip.length" class="ccol-empty">—</span>
                </div>
              </div>
            </div>
          </article>
        </Reveal>

        <Reveal v-if="buildRelics.length" tag="div">
          <article class="cboard">
            <div class="cb-head"><h3 class="build-name">Reliques à viser</h3><span class="cb-blurb">Meilleur win-impact + synergie de classe. Survol ou clic pour l'effet.</span></div>
            <div class="relchips">
              <button v-for="r in buildRelics" :key="r.id" class="relchip" :title="r.name + ' — ' + plainText(r.description)" @click="openRelic = r">
                <span class="ri"><CardImg kind="relics" :id="r.id" :image-url="r.image_url" :alt="r.name" /></span>
                <span class="rn">{{ r.name }}</span>
              </button>
            </div>
          </article>
        </Reveal>
      </template>

      <!-- DÉTAILLÉ : cartes pleines -->
      <template v-else>
        <Reveal v-for="(a, i) in buildRows" :key="a.name" :index="i" tag="div">
          <article class="build">
            <div class="build-head"><h3 class="build-name">{{ a.name }}</h3><p class="build-blurb">{{ a.blurb }}</p></div>
            <div class="build-cards">
              <GameCard v-for="c in a.cards" :key="c.id" :card="c" :char="charId!" :tier="rankMap.get(c.id)" :verdict="a.vmap.get(c.id)" @open="openCard = $event" />
              <p v-if="!a.cards.length" class="muted">Pas encore de cartes identifiées pour cet axe (données EA).</p>
            </div>
          </article>
        </Reveal>
        <Reveal v-if="traps.length" tag="div">
          <article class="build trapblock">
            <div class="build-head"><h3 class="build-name trap">⚠ Pièges — à éviter</h3><p class="build-blurb">Plus faible win-impact pour {{ meta.id[0] + meta.id.slice(1).toLowerCase() }}. À ne pas prendre sans raison précise.</p></div>
            <div class="build-cards"><GameCard v-for="c in traps" :key="c.id" :card="c" :char="charId!" verdict="skip" @open="openCard = $event" /></div>
          </article>
        </Reveal>
      </template>
    </div>

    <CardModal :card="openCard" @close="openCard = null" />
    <RelicModal :relic="openRelic" @close="openRelic = null" />
  </section>
  <section v-else class="page"><p class="lead">Personnage inconnu. <RouterLink to="/">Retour au Codex</RouterLink></p></section>
</template>

<style scoped>
.page { max-width: 2000px; margin: 0 auto; padding: 28px clamp(28px, 4vw, 64px); }
.chero { display: grid; grid-template-columns: 240px 1fr; gap: 32px; align-items: center; margin-bottom: 28px; }
.cportrait { border-radius: var(--r-lg); overflow: hidden; background: radial-gradient(120% 100% at 50% 0%, var(--accent-soft), var(--canvas)); border: 1px solid color-mix(in oklab, var(--accent) 40%, var(--hairline)); box-shadow: var(--shadow-md), 0 0 50px var(--accent-glow); aspect-ratio: 3/4; }
.cname { font-family: var(--font-display); font-weight: 700; font-size: clamp(40px, 6vw, 68px); line-height: 1; margin: 6px 0 12px; }
.cblurb { font-size: 17px; color: var(--ink-2); max-width: 62ch; line-height: 1.6; margin: 0 0 16px; }
.cstats { display: flex; gap: 18px; flex-wrap: wrap; margin-bottom: 18px; }
.stat { font-size: 14px; color: var(--ink-3); } .stat b { font-size: 22px; font-family: var(--font-display); margin-right: 5px; }
.startrow { display: flex; gap: 28px; flex-wrap: wrap; }
.sk { display: block; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-4); margin-bottom: 7px; }
.thumbs { display: flex; gap: 6px; flex-wrap: wrap; }
.sthumb { width: 38px; height: 38px; border-radius: var(--r-xs); overflow: hidden; background: var(--surface-2); border: 1px solid var(--hairline); cursor: pointer; padding: 0; }
.sthumb.relic { background: radial-gradient(circle at 50% 30%, var(--accent-soft), var(--surface-2)); cursor: default; }
.tabbar { margin-bottom: 18px; }
.note { color: var(--ink-3); font-size: 14px; max-width: 70ch; margin: 0 0 18px; }
.note b { color: var(--accent); }

.lane { display: grid; grid-template-columns: 6px 76px 1fr; gap: 14px; align-items: start; padding: 14px; background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--r-md); margin-bottom: 10px; }
.lane.empty { opacity: 0.5; }
.lane-rail { width: 6px; height: 100%; border-radius: var(--r-pill); min-height: 50px; }
.lane-head { display: flex; flex-direction: column; align-items: center; gap: 7px; position: sticky; top: 78px; }
.zone { font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; text-align: center; padding: 2px 7px; border-radius: var(--r-pill); white-space: nowrap; }
.z-pick { color: var(--good); background: color-mix(in oklab, var(--good) 16%, transparent); }
.z-meh { color: var(--warn); background: color-mix(in oklab, var(--warn) 16%, transparent); }
.z-skip { color: #ef7d6e; background: color-mix(in oklab, var(--bad) 16%, transparent); }
.lane-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 14px; }
.lane-none { color: var(--ink-4); align-self: center; }
.lowsample { margin-top: 18px; border: 1px solid var(--hairline); border-radius: var(--r-md); padding: 14px 16px; background: var(--surface); }
.lowsample summary { cursor: pointer; color: var(--ink-3); font-size: 14px; }
.lowsample .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 14px; margin-top: 14px; }

.builds { display: flex; flex-direction: column; gap: 14px; }
.build { background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--r-md); padding: 18px 20px; }
.build-head { margin-bottom: 14px; }
.build-name { font-family: var(--font-display); font-weight: 700; font-size: 26px; color: var(--accent); margin: 0 0 4px; }
.build-name.trap { color: #ef7d6e; }
.trapblock { border-color: color-mix(in oklab, var(--bad) 30%, var(--hairline)); }

/* ---- Plan de draft (compact) ---- */
.build-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
.build-toolbar .note { margin: 0; }
.cboard { background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--r-md); padding: 14px 16px; margin-bottom: 12px; }
.cb-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.cb-head .build-name { font-size: 22px; margin: 0; }
.cb-blurb { color: var(--ink-3); font-size: 13.5px; }
.ccols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; align-items: start; }
.ccol { display: flex; flex-direction: column; gap: 10px; padding: 12px; border-radius: var(--r-sm); background: var(--canvas); border: 1px solid var(--hairline); }
.col-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 10px; align-items: start; }
.ccol-h { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.ccol-h i { font-style: normal; font-size: 11px; color: var(--ink-4); margin-left: auto; }
.ccol.pick { border-color: color-mix(in oklab, var(--good) 30%, var(--hairline)); } .ccol.pick .ccol-h { color: var(--good); }
.ccol.meh .ccol-h { color: var(--warn); }
.ccol.skip { opacity: 0.92; } .ccol.skip .ccol-h { color: #ef7d6e; }
.ccol-empty { color: var(--ink-4); font-size: 13px; padding: 4px; }

.relchips { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; }
.relchip { display: flex; align-items: center; gap: 9px; background: var(--surface-2); border: 1px solid var(--hairline); border-radius: var(--r-sm); padding: 5px 10px 5px 5px; cursor: pointer; text-align: left; color: var(--ink); transition: background var(--t1) var(--ease), transform var(--t1) var(--ease), border-color var(--t1); }
.relchip:hover { background: var(--raised-2); border-color: var(--gold-dim); transform: translateY(-1px); }
.relchip:active { transform: scale(0.98); }
.ri { width: 34px; height: 34px; flex: 0 0 auto; border-radius: var(--r-xs); background: radial-gradient(circle at 50% 30%, var(--gold-soft), var(--surface)); border: 1px solid var(--hairline); display: grid; place-items: center; padding: 3px; }
.rn { font-size: 13.5px; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 900px) { .ccols { grid-template-columns: 1fr; } }
.build-blurb { color: var(--ink-2); font-size: 15px; margin: 0; }
.build-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 14px; align-items: start; }
.muted { color: var(--ink-3); font-size: 14px; font-style: italic; padding: 8px 0; }

@media (max-width: 720px) { .chero { grid-template-columns: 1fr; } .cportrait { max-width: 200px; } .lane { grid-template-columns: 6px 40px 1fr; } }
</style>
