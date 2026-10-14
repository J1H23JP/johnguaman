import { defineConfig } from 'vite';

// base relativa: el sitio funciona en https://usuario.github.io/portafolio-3d/
// y también en cualquier otro hosting estático sin tocar nada.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
});
