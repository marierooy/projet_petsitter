describe("Inscription et connexion", () => {
  const email = `test${Date.now()}@example.com`;
  const password = "Password-123";
  const first_name = "John";
  const last_name = "Doe";

  it("Permet à un utilisateur de s'inscrire", () => {
    cy.visit("/login"); // URL de ton frontend
    cy.contains("S'inscrire").click();
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="first_name"]').type(first_name);
    cy.get('input[name="last_name"]').type(last_name);
    cy.get('#petsitter-checkbox').check();
    cy.get('button[type="submit"]').click();

    cy.contains("Bienvenue"); // texte affiché après l'inscription
  });

  it("Permet à l'utilisateur de se connecter", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.contains("Bienvenue"); // texte affiché sur le tableau de bord
  });
});