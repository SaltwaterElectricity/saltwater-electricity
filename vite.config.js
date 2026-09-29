import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],

  server: {
    // Proxy configuration removed as Vercel Dev handles API routes automatically
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./setupTests.js",
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/**", "**/cypress/**"],
  },

  base: "/", // Root-resolved assets for SPA deployment on Vercel
  build: {
    outDir: process.env.BUILD_TARGET === "mobile" ? "../saltwaterelectricity/www" : "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
}));
