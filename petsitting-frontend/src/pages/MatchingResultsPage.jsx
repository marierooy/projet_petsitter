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
        // Cas 1 seul animal
        const response = await axios.post(`${process.env.REACT_APP_API_BASE}/api/matching`, requestData);
        commonPetsitters = response.data;
      } else {
        // Cas plusieurs animaux : on fait une requête par animal
        const results = await Promise.all(
          requestData.map((data) => axios.post(`${process.env.REACT_APP_API_BASE}/api/matching`, data))
        );

        // On extrait uniquement les IDs de petsitter pour chaque liste
        const listOfIdSets = results.map((res) =>
          new Set(res.data.map((p) => p.id))
        );

        // Intersection : garder seulement les IDs présents dans tous les ensembles
        const commonIds = [...listOfIdSets[0]].filter((id) =>
          listOfIdSets.every((idSet) => idSet.has(id))
        );

        // Reconstituer les objets petsitters communs à partir du premier résultat
        const allPetsitters = results.flatMap((res) => res.data);
        const seen = new Set();
        commonPetsitters = allPetsitters.filter(
          (p) => commonIds.includes(p.id) && !seen.has(p.id) && seen.add(p.id)
        );
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
                <p className="text-sm text-gray-600">{petsitter.distanceInKm}</p>
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => navigate('/contact', { state: { petsitter } })}
              >
                Voir le profil
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}