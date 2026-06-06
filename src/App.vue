<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import Lenis from 'lenis';
import AppHeader from '@/components/AppHeader.vue';

let lenis: Lenis | null = null;
let raf = 0;

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  lenis = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  const loop = (time: number) => { lenis?.raf(time); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
});
onBeforeUnmount(() => { cancelAnimationFrame(raf); lenis?.destroy(); lenis = null; });
</script>

<template>
  <AppHeader />
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
</template>

<style scoped>
.main { position: relative; z-index: 1; }
.foot {
  position: relative; z-index: 1; max-width: 1240px; margin: 0 auto; padding: 40px 28px 56px;
  display: flex; flex-direction: column; gap: 4px; color: var(--ink-4); font-size: 12.5px; border-top: 1px solid var(--hairline); margin-top: 48px;
}
.foot .dis { font-style: italic; }
</style>
