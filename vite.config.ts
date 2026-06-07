import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// base '/spire-companion/' en prod (GitHub Pages projet), '/' en dev
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/spire-companion/' : '/',
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
}));
