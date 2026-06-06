<script setup lang="ts">
defineProps<{ label?: string; block?: boolean }>();
</script>
<template>
  <div class="loader" :class="{ block }">
    <span class="ring" />
    <span v-if="label" class="lbl">{{ label }}</span>
  </div>
</template>
<style scoped>
.loader { display: inline-flex; align-items: center; gap: 12px; color: var(--ink-2); font-size: 15px; }
.loader.block { width: 100%; justify-content: center; padding: 64px 0; flex-direction: column; gap: 16px; }
.ring { width: 24px; height: 24px; border-radius: 50%; border: 2.5px solid var(--hairline-2); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
.lbl { font-family: var(--font-display); font-size: 18px; font-style: italic; }
</style>
