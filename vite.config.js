import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./setupTests.js", // We will create this next
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/**", "**/cypress/**"],
  },

  base: "./", // 👈 1. Keeps asset paths relative so the phone can find them locally!
  build: {
    // Vercel looks for 'dist' by default.
    // If you need Cordova, use 'npm run build:mobile' (see package.json update next)
    outDir: process.env.BUILD_TARGET === "mobile" ? "../saltwaterelectricity/www" : "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
});
