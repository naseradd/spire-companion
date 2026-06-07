<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import Lenis from 'lenis';
import AppHeader from '@/components/AppHeader.vue';
import CommandPalette from '@/components/CommandPalette.vue';
import CardModal from '@/components/CardModal.vue';
import RelicModal from '@/components/RelicModal.vue';
import type { Card, Relic } from '@/lib/data';

let lenis: Lenis | null = null;
let raf = 0;

const paletteOpen = ref(false);
const gCard = ref<Card | null>(null);
const gRelic = ref<Relic | null>(null);

function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); paletteOpen.value = true; }
}

onMounted(() => {
  window.addEventListener('keydown', onKey);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  lenis = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  const loop = (time: number) => { lenis?.raf(time); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
});
onBeforeUnmount(() => { window.removeEventListener('keydown', onKey); cancelAnimationFrame(raf); lenis?.destroy(); lenis = null; });
</script>

<template>
  <AppHeader @open-search="paletteOpen = true" />
  <main class="main">
    <RouterView v-slot="{ Component }">
      <Transition name="view" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <footer class="foot">
    <span>Spire Codex Companion · données <a href="https://spire-codex.com" target="_blank" rel="noopener">spire-codex.com</a></span>
    <span class="dis">Slay the Spire 2 et ses assets sont © Mega Crit Games. Projet fan non officiel, non commercial.</span>
  </footer>

  <CommandPalette v-model="paletteOpen" @card="gCard = $event" @relic="gRelic = $event" />
  <CardModal :card="gCard" @close="gCard = null" @open="gCard = $event" />
  <RelicModal :relic="gRelic" @close="gRelic = null" @card="gRelic = null; gCard = $event" />
</template>

<style scoped>
.main { position: relative; z-index: 1; }
.foot {
  position: relative; z-index: 1; max-width: 2000px; margin: 0 auto; padding: 40px clamp(28px, 4vw, 64px) 56px;
  display: flex; flex-direction: column; gap: 4px; color: var(--ink-4); font-size: 12.5px; border-top: 1px solid var(--hairline); margin-top: 48px;
}
.foot .dis { font-style: italic; }
</style>
