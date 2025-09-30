export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen container p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6">Politique de confidentialité</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Collecte des données</h2>
          <p>
            Ce site de petsitting peut collecter des informations personnelles
            via les formulaires de contact, la création de compte ou les
            demandes de prestations. Les données collectées peuvent inclure
            votre nom, prénom, adresse email, numéro de téléphone et informations
            relatives à vos animaux.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Utilisation des données</h2>
          <p>
            Les données collectées sont utilisées uniquement pour : <br />
            - Gérer les demandes de garde d’animaux <br />
            - Assurer la mise en relation entre propriétaires et petsitters <br />
            - Communiquer avec les utilisateurs concernant leurs prestations
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. Partage des données</h2>
          <p>
            Vos données ne sont jamais vendues ni partagées à des tiers à des
            fins commerciales. Elles peuvent être transmises uniquement aux
            petsitters ou propriétaires concernés par une prestation.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Conservation des données</h2>
          <p>
            Vos données sont conservées uniquement le temps nécessaire à la
            gestion des prestations et conformément aux obligations légales
            applicables.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d’un droit d’accès, de
            rectification, de suppression et d’opposition concernant vos données
            personnelles. <br />
            Pour exercer ce droit : [Ton email de contact].
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Cookies</h2>
          <p>
            Le site utilise des cookies pour améliorer l’expérience utilisateur
            et réaliser des statistiques anonymes de fréquentation. Vous pouvez
            désactiver les cookies via les paramètres de votre navigateur.
          </p>
        </section>
      </div>
    </div>
  );
}