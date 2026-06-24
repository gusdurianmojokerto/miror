import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './public/browser-mirror.html'
    }
  },
  publicDir: 'public',
  server: {
    port: 3000
  }
});