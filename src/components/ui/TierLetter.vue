<script setup lang="ts">
import { type Tier, tierColor } from '@/lib/tier';
withDefaults(defineProps<{ tier: Tier; size?: number; dim?: boolean }>(), { size: 44 });
</script>
<template>
  <span class="tl" :class="{ dim }" :style="{ width: size + 'px', height: size + 'px', color: tierColor(tier), fontSize: size * 0.5 + 'px' }">{{ tier }}</span>
</template>
<style scoped>
.tl {
  font-family: var(--font-black); display: inline-grid; place-items: center; flex: 0 0 auto;
  border-radius: var(--r-sm); border: 1.5px solid currentColor; line-height: 1;
  background: color-mix(in oklab, currentColor 12%, transparent);
  box-shadow: 0 0 16px color-mix(in oklab, currentColor 30%, transparent);
}
.tl.dim { opacity: 0.4; box-shadow: none; }
</style>
