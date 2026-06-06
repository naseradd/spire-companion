<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
withDefaults(defineProps<{ index?: number; step?: number; tag?: string }>(), { index: 0, step: 60 });
const el = ref<HTMLElement | null>(null);
let obs: IntersectionObserver | null = null;
onMounted(() => {
  if (!el.value) return;
  obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('in'); obs?.unobserve(e.target); } }),
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
  );
  obs.observe(el.value);
});
onBeforeUnmount(() => obs?.disconnect());
</script>
<template>
  <component :is="tag || 'div'" ref="el" class="reveal" :style="{ '--reveal-delay': index * step + 'ms' }"><slot /></component>
</template>
