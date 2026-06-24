import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'public/browser-mirror.html'
      }
    }
  },
  server: {
    port: 3000
  }
});