<script setup lang="ts">
withDefaults(defineProps<{ variant?: string; color?: string }>(), { variant: 'info' });
</script>
<template>
  <span class="badge" :class="variant" :style="color ? { color, borderColor: 'color-mix(in oklab, ' + color + ' 50%, transparent)', background: 'color-mix(in oklab, ' + color + ' 14%, transparent)' } : undefined"><slot /></span>
</template>
<style scoped>
.badge {
  font-family: var(--font-body); font-size: 11.5px; font-weight: 600; letter-spacing: 0.3px;
  padding: 3px 9px; border-radius: var(--r-xs); border: 1px solid var(--hairline-2);
  display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; line-height: 1.35; color: var(--ink-2);
}
.gold { color: var(--gold); border-color: var(--gold-dim); background: var(--gold-soft); }
.good { color: var(--good); border-color: color-mix(in oklab, var(--good) 45%, transparent); background: color-mix(in oklab, var(--good) 14%, transparent); }
.bad { color: var(--bad); border-color: color-mix(in oklab, var(--bad) 50%, transparent); background: color-mix(in oklab, var(--bad) 15%, transparent); }
.warn { color: var(--warn); border-color: color-mix(in oklab, var(--warn) 45%, transparent); background: color-mix(in oklab, var(--warn) 14%, transparent); }
.accent { color: var(--accent); border-color: var(--accent-dim); background: var(--accent-soft); }
</style>
