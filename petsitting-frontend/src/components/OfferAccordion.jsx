import { useState } from 'react';
import { isOccurenceAFrequence } from 'utils/helpers';

const OfferAccordion = ({ selectedAvailability }) => {
  const [openOfferId, setOpenOfferId] = useState(null);

  const toggleAccordion = (offerId) => {
    setOpenOfferId(openOfferId === offerId ? null : offerId);
  };

  return (
    <div>
      {selectedAvailability.offers
        ?.sort((a, b) => a.animalType?.id - b.animalType?.id)
        .map((offer) => (
          <div key={offer.id} className="mb-4 border rounded-md">
            <button
              onClick={() => toggleAccordion(offer.id)}
              className="w-full text-left p-5 bg-green-50 hover:bg-green-100 focus:ring-green-400 focus:bg-green-50 font-semibold text-green-800 flex justify-between items-center transition"
            >
              {offer.animalType?.name}
            </button>

            {openOfferId === offer.id && (
              <div className="p-4 bg-white rounded-b-md border-t">
                <p>
                  <span className="text-md font-bold text-green-700 mb-2">Modes de prestation :</span>{" "}
                  {offer.careModes
                    .map((careMode) =>
                      careMode.label === "home" ? "à domicile" : "chez le petsitter"
                    )
                    .join(", ")}
                </p>
                <p><span className="text-md font-bold text-green-700 mb-2">Nombre d’animaux max :</span> {offer.number_animals}</p>
                <p><span className="text-md font-bold text-green-700 mb-2">Prix :</span> {offer.offer_price} € par jour + {offer.travel_price} € par déplacement</p>
                <p><span className="text-md font-bold text-green-700 mb-2">Prestations :</span></p>
                <ul>
                  {Object.entries(
                      offer.offerServiceOccurences
                      ?.filter((oso) => oso.checked)
                      .reduce((acc, oso) => {
                          const label = oso.service?.label || 'Inconnu';
                          if (!acc[label]) acc[label] = [];
                          acc[label].push(oso);
                          return acc;
                      }, {})
                  ).map(([serviceLabel, occurences]) => (
                      <li key={serviceLabel} className="mb-5">
                        <span className="inline-block bg-green-100 text-green-800 text-md font-semibold px-3 py-1 rounded-full">{serviceLabel}</span>
                        <ul className="ml-6 list-disc marker:text-green-500 list-outside">
                          {occurences.map((oso) => (
                            <li key={oso.id}>
                              {oso.occurence?.label}. Prix : + {(oso.price || 0)} € {isOccurenceAFrequence(oso.occurence?.label) ? 'par jour.': '.'}
                            </li>
                          ))}
                        </ul>
                      </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default OfferAccordion;