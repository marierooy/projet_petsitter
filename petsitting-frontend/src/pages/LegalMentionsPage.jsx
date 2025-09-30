export default function LegalMentionsPage() {
  return (
    <div className="min-h-screen container p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6">Mentions légales</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Éditeur du site</h2>
          <p>
            Ce site est édité par <strong>Marie Rooy</strong>,
            particulier, domicilié à : <br />
            <span className="italic">6 rue Neuve Popincourt 75011 Paris</span>
          </p>
          <p className="mt-2">Email : rooy.marie@gmail.com</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Hébergement</h2>
          <p>
            Le site est hébergé par : <br />
            <strong>[Nom de l’hébergeur]</strong> <br />
            Adresse : [Adresse complète de l’hébergeur] <br />
            Téléphone : [Numéro de téléphone de l’hébergeur]
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Propriété intellectuelle</h2>
          <p>
            L’ensemble du contenu de ce site (textes, images, graphismes, logo,
            etc.) est protégé par le droit de la propriété intellectuelle.
            Toute reproduction ou représentation est interdite sans
            autorisation préalable.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Données personnelles</h2>
          <p>
            Les informations collectées via ce site sont utilisées uniquement
            pour répondre aux demandes de contact et la gestion des prestations
            de petsitting. Conformément au Règlement Général sur la Protection
            des Données (RGPD), vous disposez d’un droit d’accès, de
            rectification et de suppression de vos données. <br />
            Pour exercer ce droit : rooy.marie@gmail.com.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Cookies</h2>
          <p>
            Ce site peut utiliser des cookies afin d’améliorer l’expérience de
            navigation et de réaliser des statistiques de visites. Vous pouvez
            configurer votre navigateur pour refuser l’utilisation de cookies.
          </p>
        </section>
      </div>
    </div>
  );
}