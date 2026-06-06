<script setup lang="ts">
import { ref } from 'vue';
import { imgLocal, imgRemote } from '@/lib/data';

const props = withDefaults(
  defineProps<{ kind: 'cards' | 'relics' | 'potions' | 'characters'; id: string; imageUrl: string; alt?: string; ratio?: string }>(),
  { ratio: '' },
);

// local d'abord (téléchargé), fallback hotlink spire-codex, puis placeholder
const triedRemote = ref(false);
const failed = ref(false);
const src = ref(imgLocal(props.kind, props.id, props.imageUrl));
function onErr() {
  if (!triedRemote.value) { triedRemote.value = true; src.value = imgRemote(props.imageUrl); }
  else failed.value = true;
}
</script>

<template>
  <div class="cimg" :style="ratio ? { aspectRatio: ratio } : undefined">
    <img v-if="!failed" :src="src" :alt="alt || ''" loading="lazy" decoding="async" @error="onErr" />
    <span v-else class="ph">✦</span>
  </div>
</template>

<style scoped>
.cimg { position: relative; display: grid; place-items: center; overflow: hidden; width: 100%; height: 100%; }
.cimg img { width: 100%; height: 100%; object-fit: contain; display: block; }
.ph { color: var(--ink-4); font-size: 1.4em; }
</style>
