describe("Gestion des disponibilités du petsitter", () => {
  beforeEach(() => {
    // ⚡ Connexion d’un utilisateur "petsitter"
    cy.visit("/login");
    cy.get('input[name="email"]').type("rooy.marie@gmail.com");
    cy.get('input[name="password"]').type("Mitchoune-28");
    cy.get('button[type="submit"]').click();
    cy.contains("Bienvenue");
  });

  it("Ajoute une disponibilité avec un nouveau type", () => {
    // Aller sur la page calendrier
    cy.visit("/disponibilites");

    // Vérifier que le calendrier est présent
    cy.contains("Calendrier").should("exist");

    cy.contains("Ajouter un type").click();

    cy.get(".modal").within(() => {
        cy.get('input[name="label"]').type("Travaille la journée");
        cy.get('input[name="color"]').type("#ff0000");
        cy.get('button[type="submit"]').click();
    })

    cy.contains("Créer une disponibilité").click();

    cy.get(".modal").within(() => {
        // Le type nouvellement créé doit apparaître dans la liste déroulante
        cy.get('select[name="availabilityTypeId"]').select("Travaille la journée");
        // Renseigner la période (dates)
        cy.get('input[name="start_date"]').type("2025-10-01");
        cy.get('input[name="end_date"]').type("2025-10-15");
        cy.get('button[type="submit"]').click();
    })

    // Vérifier que la disponibilité est affichée dans le calendrier
    cy.contains("Travaille la journée").should("exist");
  });

  it("Paramètre une disponibilité", () => {
    cy.visit("/disponibilites");

    // ⚡ Trouver la disponibilité "Travaille la journée"
    cy.contains("Travaille la journée")
    .closest(".rbc-event")
    .as("event");

    cy.get("@event").click();

    cy.get(".modal").within(() => {
        cy.contains("Paramétrer").click();
    })

    cy.contains('.font-semibold.text-green-800', 'Petit chien (<9 kg)').closest('div').find('button.supress-animal').click();
    cy.contains('.font-semibold.text-green-800', 'Chien de 10 à 20 kg').closest('div').find('button.supress-animal').click();
    cy.contains('.font-semibold.text-green-800', 'Chien de 20 à 40kg').closest('div').find('button.supress-animal').click();
    cy.contains('.font-semibold.text-green-800', 'Chien >40kg').closest('div').find('button.supress-animal').click();
    cy.contains('.font-semibold.text-green-800', 'Furet').closest('div').find('button.supress-animal').click();
    cy.contains('.font-semibold.text-green-800', 'Oiseau').closest('div').find('button.supress-animal').click();
    cy.contains('.font-semibold.text-green-800', 'Reptile').closest('div').find('button.supress-animal').click();
    cy.contains('.font-semibold.text-green-800', 'Poisson').closest('div').find('button.supress-animal').click();
    cy.contains('.font-semibold.text-green-800', 'Tortue').closest('div').find('button.supress-animal').click();
    cy.contains('.font-semibold.text-green-800', 'Poule').closest('div').find('button.supress-animal').click();

    cy.contains("Chat").closest("div[role='button']").click();

    // 3️⃣ Cocher les care modes
    cy.get("input#home-5").check({ force: true }); // Garde à domicile
    cy.get("input#sitter-5").check({ force: true }); // Garde chez le petsitter

    // 4️⃣ Remplir nombre d'animaux
    cy.get("input#animals-5").clear().type("3");

    // 5️⃣ Remplir prix prestation
    cy.get("input#price-5").clear().type("7");

    // 6️⃣ Remplir prix déplacement si care mode 'home' coché
    cy.get("input#travel-5").clear().type("1");

    // 7️⃣ Cocher des occurrences pour un service (par ex. toilettage)
    cy.get("input#occ-5-2-4").check({ force: true });
    cy.get("input#occ-5-2-5").check({ force: true });
    cy.get("input#occ-5-2-6").check({ force: true });
    cy.get("input#occ-price-5-2-6").clear().type("2"); // prix additif si applicable

    // 7️⃣ Cocher des occurrences pour un service (par ex. toilettage)
    cy.get("input#occ-5-3-7").check({ force: true });
    cy.get("input#occ-5-3-8").check({ force: true });
    cy.get("input#occ-5-3-9").check({ force: true });
    cy.get("input#occ-price-5-3-9").clear().type("3"); // prix additif si applicable

    // 8️⃣ Ajouter un nouveau service
    cy.get("select.select-service").select("Toilettage"); // adapte selon option
    cy.contains("+ Ajouter").click();

        // 7️⃣ Cocher des occurrences pour un service (par ex. toilettage)
    cy.get("input#occ-5-8-4").check({ force: true });
    cy.get("input#occ-5-8-7").check({ force: true });
    cy.get("input#occ-5-8-8").check({ force: true });
    cy.get("input#occ-5-8-9").check({ force: true });

    // 9️⃣ Vérifier que les champs sont correctement remplis
    cy.get("input#animals-5").should("have.value", "3");
    cy.get("input#price-5").should("have.value", "7");
    cy.get("input#travel-5").should("have.value", "1");
    cy.get("input#occ-5-2-4").should("be.checked");

    cy.get('button.all-offers-saving').click();

  });
});
