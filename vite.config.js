import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
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

  base: command === "build" ? "./" : "/", // 👈 Only use relative paths for production builds
  build: {
    outDir: process.env.BUILD_TARGET === "mobile" ? "../saltwaterelectricity/www" : "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
}));
