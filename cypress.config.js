import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: false, // Disabling support file for simplicity in this initial setup
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },
});
