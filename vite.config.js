import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' 

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './setupTests.js', // We will create this next
  },
  
  base: './', // 👈 1. Keeps asset paths relative so the phone can find them locally!
  build: {
    outDir: '../saltwaterelectricity/www', // 👈 2. Jumps out of website, into your cordova www
    emptyOutDir: true, // Automatically cleans out old mobile files before exporting new ones
    chunkSizeWarningLimit: 1000,
  }
})
