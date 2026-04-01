import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // @google/genai est utilisé dans PromoVideo.tsx (génération vidéo IA)
      // Il est optionnel et ne doit pas bloquer le build si absent
      external: [],
    },
  },
  define: {
    // Permet à PromoVideo.tsx d'accéder à process.env.API_KEY
    'process.env': {},
  },
});
