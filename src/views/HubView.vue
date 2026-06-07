<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PLAYABLE, characters, charById, cards, meta, type Card } from '@/lib/data';
import { CHAR_META } from '@/lib/characters';
import { cardScore, isLowSample } from '@/lib/tier';
import CardImg from '@/components/ui/CardImg.vue';
import GameCard from '@/components/GameCard.vue';
import CardModal from '@/components/CardModal.vue';
import Reveal from '@/components/ui/Reveal.vue';
import Badge from '@/components/ui/Badge.vue';
import { dateFr } from '@/lib/format';

gsap.registerPlugin(ScrollTrigger);
const router = useRouter();

const charAccent: Record<string, string> = { IRONCLAD: '#c0392b', SILENT: '#2fae73', DEFECT: '#3e78d4', REGENT: '#e0a52e', NECROBINDER: '#b5478c' };

// top cartes du moment (meilleur Codex Score, échantillon fiable, cartes jouables non-basiques)
const topCards = computed<Card[]>(() =>
  cards
    .filter((c) => ['Attack', 'Skill', 'Power'].includes(c.type) && !['curse', 'status', 'colorless'].includes(c.color))
    .map((c) => ({ c, s: cardScore(c.id) }))
    .filter((x) => x.s && !isLowSample(x.s))
    .sort((a, b) => (b.s!.score - a.s!.score) || (b.s!.picks - a.s!.picks))
    .slice(0, 12)
    .map((x) => x.c),
);

const openCard = ref<Card | null>(null);
const stage = ref<HTMLElement | null>(null);
let ctx: gsap.Context | null = null;

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !stage.value) return;
  ctx = gsap.context((self) => {
    const q = self.selector!;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.ascent', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    });
    // washes de biome qui se succèdent (overgrowth -> underdocks -> spire)
    tl.to(q('.b1'), { opacity: 0, duration: 1 }, 0.25)
      .fromTo(q('.b2'), { opacity: 0 }, { opacity: 1, duration: 1 }, 0.25)
      .to(q('.b2'), { opacity: 0, duration: 1 }, 1.4)
      .fromTo(q('.b3'), { opacity: 0 }, { opacity: 1, duration: 1 }, 1.4);
    // titre : monte + s'éclaircit
    tl.to(q('.hero-inner'), { y: -60, duration: 3 }, 0);
    tl.to(q('.rail-fill'), { scaleY: 1, duration: 3, ease: 'none' }, 0);
    // glyphes flottants parallax
    gsap.to(q('.glyph'), { y: (i) => -80 - i * 40, ease: 'none', scrollTrigger: { trigger: '.ascent', start: 'top top', end: 'bottom bottom', scrub: 1 } });
  }, stage.value);
});
onBeforeUnmount(() => { ctx?.revert(); ScrollTrigger.getAll().forEach((t) => t.kill()); });

function goChar(slug: string) { router.push('/c/' + slug); }
</script>

<template>
  <section class="view">
    <!-- HERO : ascension de la Spire -->
    <div class="ascent" ref="stage">
      <div class="stage">
        <div class="biome b1" />
        <div class="biome b2" />
        <div class="biome b3" />
        <span class="glyph g1">✦</span>
        <span class="glyph g2">✧</span>
        <span class="glyph g3">✦</span>
        <div class="vignette" />
        <div class="rail"><span class="rail-fill" /></div>
        <div class="hero-inner">
          <span class="kicker">Slay the Spire II · compagnon</span>
          <h1 class="hero-title wordmark">Spire Codex</h1>
          <span class="hero-rule" />
          <p class="hero-sub">Tier lists <em>data-driven</em> par personnage, builds optimisés et base de cartes — assets réels, win-impact sur 184k+ runs.</p>
          <div class="hero-cta">
            <a href="#classes" class="btn primary">Choisir une classe</a>
            <RouterLink to="/cards" class="btn ghost">Explorer les cartes</RouterLink>
          </div>
          <div class="hero-stats">
            <span><b class="num">{{ meta.counts.cards }}</b> cartes</span><i>·</i>
            <span><b class="num">5</b> classes</span><i>·</i>
            <span><b class="num">{{ meta.counts.relics }}</b> reliques</span><i>·</i>
            <span><b class="num">184k+</b> runs</span>
          </div>
          <span class="scrollhint">↓ scrolle pour gravir la Spire</span>
        </div>
      </div>
    </div>

    <!-- CLASSES -->
    <section id="classes" class="block">
      <Reveal tag="div" class="block-head">
        <span class="kicker">Les cinq archétypes</span>
        <h2 class="section-title">Choisis ta classe</h2>
        <p class="lead">Chaque classe colore l'app de sa teinte et ouvre ses tier lists, builds et deck de départ.</p>
      </Reveal>
      <div class="class-grid">
        <Reveal v-for="(id, i) in PLAYABLE" :key="id" :index="i">
          <button class="class-card" :style="{ '--c': charAccent[id] }" @click="goChar(CHAR_META[id].slug)">
            <span class="portrait">
              <CardImg v-if="charById.get(id)" kind="characters" :id="id" :image-url="charById.get(id)!.image_url" :alt="id" />
            </span>
            <span class="cc-body">
              <span class="cc-top">
                <span class="cc-name">{{ id[0] + id.slice(1).toLowerCase() }}</span>
                <Badge v-if="CHAR_META[id].isNew" variant="accent">Nouveau</Badge>
              </span>
              <span class="cc-tag">{{ CHAR_META[id].tagline }}</span>
              <span class="cc-blurb">{{ CHAR_META[id].blurb }}</span>
              <span class="cc-go">Voir tier list & builds →</span>
            </span>
          </button>
        </Reveal>
      </div>
    </section>

    <hr class="filigree" />

    <!-- TOP CARTES -->
    <section class="block">
      <Reveal tag="div" class="block-head">
        <span class="kicker">Méta du moment</span>
        <h2 class="section-title">Cartes les mieux notées</h2>
        <p class="lead">Plus haut Codex Score toutes classes confondues, échantillon fiable. Clique pour le détail et le win-impact par perso.</p>
      </Reveal>
      <Reveal tag="div" class="topgrid">
        <GameCard v-for="c in topCards" :key="c.id" :card="c" @open="openCard = $event" />
      </Reveal>
    </section>

    <!-- PATCH -->
    <section class="block">
      <Reveal tag="div" class="patchcard">
        <div>
          <span class="kicker">Fraîcheur des données</span>
          <h3 class="pc-title">Spire Codex · {{ characters.length }} classes · {{ meta.counts.cards }} cartes · {{ meta.counts.relics }} reliques</h3>
          <p class="pc-sub">Ingéré le {{ dateFr(meta.ingestedAt) }} depuis spire-codex.com. Jeu en Early Access : la méta bouge à chaque patch — les notes sont des instantanés.</p>
        </div>
        <ul class="changes">
          <li v-for="ch in meta.recentChanges.slice(0, 4)" :key="ch.version"><b>{{ ch.version }}</b> <span class="cd">{{ ch.date }}</span></li>
        </ul>
      </Reveal>
    </section>

    <CardModal :card="openCard" @close="openCard = null" @open="openCard = $event" />
  </section>
</template>

<style scoped>
.view { position: relative; }

/* ---- HERO ascent ---- */
.ascent { position: relative; height: 165vh; }
.stage { position: sticky; top: 0; height: 100vh; overflow: hidden; display: grid; place-items: center; }
.vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(120% 80% at 50% 42%, transparent 38%, rgba(8, 7, 11, 0.55) 100%); }
.biome { position: absolute; inset: 0; pointer-events: none; }
.b1 { background: radial-gradient(100% 80% at 50% 120%, rgba(47, 174, 115, 0.22), transparent 60%), radial-gradient(80% 60% at 20% 90%, rgba(47,174,115,.12), transparent 55%); }
.b2 { background: radial-gradient(100% 80% at 50% 120%, rgba(62, 120, 212, 0.22), transparent 60%), radial-gradient(70% 60% at 80% 80%, rgba(62,120,212,.14), transparent 55%); opacity: 0; }
.b3 { background: radial-gradient(120% 90% at 50% 130%, rgba(181, 71, 140, 0.28), transparent 60%), radial-gradient(90% 70% at 50% 0%, rgba(201,162,75,.12), transparent 55%); opacity: 0; }
.glyph { position: absolute; color: var(--gold); opacity: 0.18; font-size: 40px; filter: blur(.3px); }
.g1 { top: 20%; left: 16%; } .g2 { top: 64%; left: 78%; font-size: 26px; } .g3 { top: 40%; left: 60%; font-size: 30px; }
.rail { position: absolute; left: 50%; top: 12%; bottom: 12%; width: 2px; transform: translateX(-50%); background: var(--hairline); border-radius: var(--r-pill); }
.rail-fill { position: absolute; inset: 0; transform-origin: top; transform: scaleY(0); background: linear-gradient(180deg, var(--gold), var(--r-ancient)); box-shadow: 0 0 14px var(--gold-glow); border-radius: var(--r-pill); }
.hero-inner { position: relative; z-index: 2; text-align: center; max-width: 760px; padding: 0 24px; }
.hero-title { font-size: clamp(56px, 12vw, 148px); line-height: 0.92; margin: 10px 0 10px; color: var(--ink); text-shadow: 0 0 70px rgba(201, 162, 75, 0.28), 0 2px 30px rgba(0,0,0,.6); }
.hero-rule { display: block; width: 180px; height: 2px; margin: 0 auto 18px; background: linear-gradient(90deg, transparent, var(--gold) 50%, transparent); box-shadow: 0 0 10px var(--gold-glow); }
.hero-sub { font-size: clamp(17px, 2.2vw, 22px); color: var(--ink-2); max-width: 620px; margin: 0 auto 26px; line-height: 1.55; }
.hero-stats { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: baseline; margin-top: 24px; color: var(--ink-3); font-size: 14px; }
.hero-stats b { color: var(--gold); font-family: var(--font-display); font-size: 18px; margin-right: 4px; }
.hero-stats i { color: var(--ink-4); font-style: normal; }
.hero-sub em { color: var(--gold); font-style: italic; }
.hero-cta { display: flex; gap: 12px; justify-content: center; }
.btn { padding: 12px 22px; border-radius: var(--r-pill); font-size: 16px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: transform var(--t1) var(--ease-out-quart), box-shadow var(--t2); }
.btn.primary { background: var(--gold); color: var(--ink-on-gold); box-shadow: var(--shadow-gold); }
.btn.primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-md), var(--shadow-gold); }
.btn.ghost { background: transparent; border-color: var(--hairline-2); color: var(--ink); }
.btn.ghost:hover { border-color: var(--gold-dim); color: var(--gold); }
.scrollhint { display: block; margin-top: 34px; font-size: 13px; color: var(--ink-4); letter-spacing: 1px; animation: float-soft 2.6s var(--ease) infinite; }

/* ---- blocks ---- */
.block { max-width: 2000px; margin: 0 auto; padding: 24px clamp(28px, 4vw, 64px); }
.block-head { margin-bottom: 22px; }
.class-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.class-card {
  --c: var(--gold);
  display: grid; grid-template-columns: 116px 1fr; gap: 0; text-align: left; cursor: pointer;
  background: linear-gradient(180deg, var(--raised), var(--surface)); border: 1px solid var(--hairline);
  border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--shadow-sm);
  transition: transform var(--t2) var(--ease-out-quart), box-shadow var(--t2), border-color var(--t1);
}
.class-card:hover { transform: translateY(-4px); border-color: color-mix(in oklab, var(--c) 55%, transparent); box-shadow: var(--shadow-md), 0 0 40px color-mix(in oklab, var(--c) 18%, transparent); }
.class-card:active { transform: translateY(-1px) scale(0.995); }
.portrait { position: relative; background: radial-gradient(120% 100% at 50% 0%, color-mix(in oklab, var(--c) 30%, var(--surface-2)), var(--canvas)); display: grid; place-items: center; padding: 8px; }
.portrait :deep(.cimg) { animation: float-soft 5s var(--ease) infinite; }
.cc-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 5px; }
.cc-top { display: flex; align-items: center; gap: 9px; }
.cc-name { font-family: var(--font-display); font-weight: 700; font-size: 26px; color: var(--ink); }
.cc-tag { font-size: 12.5px; letter-spacing: 1px; text-transform: uppercase; color: var(--c); font-weight: 600; }
.cc-blurb { font-size: 14px; color: var(--ink-2); line-height: 1.5; margin-top: 2px; }
.cc-go { margin-top: auto; font-size: 13.5px; color: var(--c); font-weight: 600; }

.topgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 16px; }

.patchcard { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; background: linear-gradient(180deg, var(--raised), var(--surface)); border: 1px solid var(--hairline); border-radius: var(--r-lg); padding: 22px 24px; }
.pc-title { font-family: var(--font-display); font-weight: 600; font-size: 22px; margin: 6px 0 6px; }
.pc-sub { color: var(--ink-2); font-size: 14.5px; max-width: 62ch; margin: 0; }
.changes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; font-size: 13.5px; min-width: 160px; }
.changes b { color: var(--gold); }
.changes .cd { color: var(--ink-4); margin-left: 8px; }

@media (max-width: 600px) { .class-grid { grid-template-columns: 1fr; } }
</style>
