describe("Gestion des animaux", () => {
  beforeEach(() => {
    // Assure-toi que l'utilisateur est connecté avant chaque test
    // Ici on suppose que tu as un bouton "Connexion" ou un login via API
    cy.visit("/login");

    cy.get('input[name="email"]').type("rooy.marie@gmail.com");
    cy.get('input[name="password"]').type("Mitchoune-28");
    cy.get('button[type="submit"]').click();
    cy.contains("Bienvenue");
  });

  it("Ajouter → Modifier → Supprimer un animal", () => {
    const animalName = 'Rex';
    const updatedAnimalName = 'Leon';
    // 🔹 Aller sur la page des animaux
    cy.visit("/mes-animaux");

    // === Ajouter un animal ===
    cy.contains("Ajouter un animal").click();

    cy.get(".modal").within(() => {
      cy.get('input[name="name"]').type(animalName);
      cy.get('select[name="animalTypeId"]').select("Chat");
      cy.get('input[name="birthDate"]').type("2020-05-10");
      cy.get('input[name="gender"][value="m"]').check();
      cy.get('textarea[name="description"]').type("Petit chien joueur et affectueux, aime les promenades quotidiennes.");
      cy.get('button[type="submit"]').click();
    });

    // Vérifier que l’animal apparaît dans la liste
    cy.contains(animalName).should("exist");

    // === Modifier l’animal ===
    cy.contains(animalName).closest("li").contains("button", "Modifier").click();

    cy.get(".modal").within(() => {
        cy.get('input[name="name"]').clear().type(updatedAnimalName);
        cy.get('button[type="submit"]').click();
    })

    // Vérifier que le nouveau nom est affiché
    cy.contains(updatedAnimalName).should("exist");
    cy.contains(animalName).should("not.exist");

    // === Supprimer l’animal ===
    cy.contains(updatedAnimalName).closest("li").contains("button", "Supprimer").click();


    // Vérifier qu’il n’apparaît plus dans la liste
    cy.contains(updatedAnimalName).should("not.exist");
  });
});