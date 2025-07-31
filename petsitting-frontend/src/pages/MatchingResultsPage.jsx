import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MatchingResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const requestData = location.state;

  const [petsitters, setPetsitters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestData || requestData.length === 0) return;

    const fetchCommonPetsitters = async () => {
      try {
        let commonPetsitters = [];

        if (!Array.isArray(requestData)) {
          const response = await axios.post(`${process.env.REACT_APP_API_BASE}/api/matching`, requestData);
          commonPetsitters = response.data.map(p => ({
            ...p,
            syntheticOffers: {
              [requestData.animalId]: p.syntheticOffer, // ou autre clé selon ton backend
            },
          }));
        } else {
          const results = await Promise.all(
            requestData.map((data) => axios.post(`${process.env.REACT_APP_API_BASE}/api/matching`, data))
          ); console.log('results', results)

          const listOfIdSets = results.map((res) =>
            new Set(res.data.map((p) => p.id))
          );

          const commonIds = [...listOfIdSets[0]].filter((id) =>
            listOfIdSets.every((idSet) => idSet.has(id))
          );

          const petsitterMap = {};

          results.forEach((res, index) => {
            const animalId = requestData[index].animalId;
            res.data.forEach((p) => {
              if (!commonIds.includes(p.id)) return;

              if (!petsitterMap[p.id]) {
                petsitterMap[p.id] = {
                  ...p,
                  syntheticOffers: [],
                  total_price: 0,
                };
              }

              petsitterMap[p.id].syntheticOffers.push({
                animalId,
                syntheticOffer: p.syntheticOffer,
              });

              // Ajoute totalPrice de la réponse à total_price global
              if (typeof p.totalPrice === 'number') {
                petsitterMap[p.id].total_price += p.totalPrice;
              }
            });
          });

          // Facultatif : arrondi final du total_price
          Object.values(petsitterMap).forEach(p => {
            p.total_price = Math.round(p.total_price * 100) / 100;
          });
          commonPetsitters = Object.values(petsitterMap);
        }

        setPetsitters(commonPetsitters);
      } catch (error) {
        console.error('Erreur lors du chargement des petsitters :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommonPetsitters();
  }, [requestData]);

  const handleSelectPetsitter = async (petsitter) => {
    try {
      const token = localStorage.getItem('token');
      // ✅ Enregistrement des syntheticOffers liés à ce contract
      // const syntheticOffers = Object.values(petsitter.syntheticOffers); // { animalId: syntheticOffer }

      // console.log(petsitter.syntheticOffers)

      const syntheticResponse = await axios.post(
        `${process.env.REACT_APP_API_BASE}/api/offer/synthetic`,
        petsitter.syntheticOffers,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdOffers = syntheticResponse.data; // tableau avec au moins id + animalId

      // Associe chaque id à son entrée d'origine
      petsitter.syntheticOffers = petsitter.syntheticOffers.map((offerItem) => {
        const match = createdOffers.find(
          (o) => parseInt(o.animalId) === parseInt(offerItem.animalId)
        );

        if (match) {
          offerItem.syntheticOffer.offerId = match.id; // Injecte l'id retourné
        }

        return offerItem;
      });

      const response = await axios.post(`${process.env.REACT_APP_API_BASE}/api/contract`, { 
        petsitter, 
        requestData
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contract = response.data;

      // navigate('/mes-contrats');
    } catch (error) {
      console.error("Erreur lors de la création du contrat ou des offres :", error);
      alert("Une erreur est survenue.");
    }
  };

  if (!requestData) {
    return (
      <div className="p-4 text-red-600">
        Aucune donnée fournie. Veuillez retourner à la page de demande.
      </div>
    );
  }

  if (loading) {
    return <div className="p-4">Chargement des résultats...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Petsitters disponibles</h1>

      {petsitters.length === 0 ? (
        <p className="text-gray-600">Aucun petsitter ne correspond à votre demande.</p>
      ) : (
        <ul className="space-y-4">
          {petsitters.map((petsitter) => (
            <li
              key={petsitter.id}
              className="border rounded-lg p-4 bg-white shadow flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  {petsitter.first_name} {petsitter.last_name}
                </h2>
              </div>
              <div>
                <p className="text-sm text-gray-600">{petsitter.totalPrice} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{petsitter.distanceInKm} km</p>
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => navigate('/contact', { state: { petsitter } })}
              >
                Voir le profil
              </button>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={() => handleSelectPetsitter(petsitter)}
              >
                Choisir ce petsitter
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}