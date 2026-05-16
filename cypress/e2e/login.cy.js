describe("Login Page", () => {
  beforeEach(() => {
    // Vite's default dev port is configured in cypress.config.js as baseUrl
    cy.visit("/login");
  });

  it("should show progress bar after successful login", () => {
    // 1. Fill in the email and password fields
    cy.get('input[placeholder="name@example.com"]').type("test@example.com");
    cy.get('input[placeholder="••••••••"]').type("password123");

    // 2. Click the 'LOGIN NOW' button
    cy.contains("button", /LOGIN NOW/i).click();

    // 3. Verify that the 'isRedirecting' progress bar animation appears
    // In our implementation, this is the "Access Granted" modal with the progress bar
    cy.contains("Access Granted", { timeout: 10000 }).should("be.visible");
    cy.contains("Establishing Secure Tunnel").should("be.visible");
    cy.get(".progress-shimmer").should("be.visible");

    // Optional: Verify it eventually navigates to dashboard
    cy.url({ timeout: 10000 }).should("include", "/dashboard");
  });
});
