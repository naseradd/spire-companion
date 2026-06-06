<script setup lang="ts">
import { PLAYABLE } from '@/lib/data';
import { meta } from '@/lib/data';
import { CHAR_META } from '@/lib/characters';
import { dateFr } from '@/lib/format';

const charAccent: Record<string, string> = {
  IRONCLAD: '#c0392b', SILENT: '#2fae73', DEFECT: '#3e78d4', REGENT: '#e0a52e', NECROBINDER: '#b5478c',
};
const nav = [
  { to: '/', label: 'Codex', exact: true },
  { to: '/cards', label: 'Cartes' },
  { to: '/relics', label: 'Reliques' },
  { to: '/glossary', label: 'Systèmes' },
];
</script>

<template>
  <header class="hdr">
    <RouterLink to="/" class="brand">
      <span class="mark">✦</span>
      <span class="word wordmark">Spire Codex</span>
    </RouterLink>

    <nav class="nav">
      <RouterLink v-for="n in nav" :key="n.to" :to="n.to" class="navlink" active-class="on" :exact-active-class="n.exact ? 'on' : ''">{{ n.label }}</RouterLink>
    </nav>

    <div class="spacer" />

    <div class="chars">
      <RouterLink v-for="id in PLAYABLE" :key="id" :to="'/c/' + CHAR_META[id].slug" class="chardot" :title="CHAR_META[id].id" active-class="on" :style="{ '--c': charAccent[id] }">
        <span class="dot" />
        <span class="cn">{{ id[0] + id.slice(1).toLowerCase() }}</span>
      </RouterLink>
    </div>

    <div class="patch" :title="'Données ingérées le ' + dateFr(meta.ingestedAt)">
      <span class="ember" />
      <span class="pt">Spire Codex · {{ dateFr(meta.ingestedAt) }}</span>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 18px; padding: 12px 28px;
  background: color-mix(in oklab, var(--canvas) 82%, transparent);
  backdrop-filter: blur(12px) saturate(1.2);
  border-bottom: 1px solid var(--hairline);
}
.brand { display: flex; align-items: center; gap: 11px; color: var(--ink); }
.mark { color: var(--gold); font-size: 20px; filter: drop-shadow(0 0 10px var(--gold-glow)); }
.word { font-size: 21px; color: var(--ink); letter-spacing: 0.5px; }
.nav { display: flex; gap: 4px; }
.navlink { padding: 8px 14px; border-radius: var(--r-sm); color: var(--ink-2); font-size: 15.5px; font-weight: 500; }
.navlink:hover { color: var(--ink); background: var(--surface-2); }
.navlink.on { color: var(--gold); background: var(--gold-soft); }
.spacer { flex: 1; }
.chars { display: flex; gap: 3px; }
.chardot { display: inline-flex; align-items: center; gap: 7px; padding: 6px 11px; border-radius: var(--r-pill); color: var(--ink-3); font-size: 13.5px; transition: all var(--t1) var(--ease); }
.chardot .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px color-mix(in oklab, var(--c) 60%, transparent); }
.chardot:hover { color: var(--ink); background: var(--surface-2); }
.chardot.on { color: var(--ink); background: color-mix(in oklab, var(--c) 16%, transparent); box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--c) 50%, transparent); }
.cn { font-weight: 500; }
.patch { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--ink-3); white-space: nowrap; }
.ember { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 8px var(--gold-glow); animation: ember 2.6s var(--ease) infinite; }
@media (max-width: 1080px) { .chars .cn { display: none; } .patch .pt { display: none; } }
@media (max-width: 760px) { .nav { display: none; } }
</style>
