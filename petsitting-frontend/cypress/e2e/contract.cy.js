describe("Recherche de petsitting - Propriétaire", () => {
  const email = "test@test.fr";
  const password = "mitchoune";

  before(() => {
    // Visite la page de login et se connecte
    cy.visit("/login");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.contains("Bienvenue");
  });

  it("Recherche un petsitting pour un animal", () => {
    // 1️⃣ Aller sur la page de recherche
    cy.visit("/chercher-petsitting");

    cy.get("select.select-animal").first().select(1);
    cy.contains("+ Ajouter cet animal").click();

    cy.contains("Services pour").should("exist");

    // ➕ Ajouter un service
    cy.get("select.inputForm").last().select(1); // choisir le 1er service dispo
    cy.contains("+ Ajouter service").click();

    // Vérifie que le service apparaît dans la liste
    cy.get("ul li").should("have.length.at.least", 1);

    // 🔄 Sélectionner une occurrence pour ce service
    cy.get("ul li select").first().select(1);

    // 11️⃣ Soumettre la demande
    cy.get('button[type="submit"]').contains("Envoyer la demande").click();
  });
});