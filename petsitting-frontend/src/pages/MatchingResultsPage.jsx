import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StarRating } from 'utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Composant filtre étoiles cliquables
function StarFilter({ currentRating, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1 select-none" aria-label="Filtrer par note minimale">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => onChange(star === currentRating ? 0 : star)} // toggle clic
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          xmlns="http://www.w3.org/2000/svg"
          fill={star <= (hover || currentRating) ? 'gold' : 'none'}
          stroke="gold"
          strokeWidth={1.5}
          className="w-6 h-6 cursor-pointer"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onChange(star === currentRating ? 0 : star);
            }
          }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
        </svg>
      ))}
      {currentRating > 0 && (
        <button
          onClick={() => onChange(0)}
          className="ml-2 text-sm underline text-blue-600 hover:text-blue-800"
          aria-label="Réinitialiser le filtre par note"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}

export default function MatchingResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const requestData = location.state;
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [petsitters, setPetsitters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [maxPrice, setMaxPrice] = useState('');
  const [maxDistance, setMaxDistance] = useState(20);
  const [minRating, setMinRating] = useState(0); // 0 = pas de filtre par note

  // Tri (simple)
  const [sortBy, setSortBy] = useState('price'); // 'price' | 'distance' | 'rating'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

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
              [requestData.animalId]: p.syntheticOffer,
            },
          }));
        } else {
          const results = await Promise.all(
            requestData.map((data) => axios.post(`${process.env.REACT_APP_API_BASE}/api/matching`, data))
          );

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
                  total_allAnimals_price: 0,
                };
              }

              petsitterMap[p.id].syntheticOffers.push({
                animalId,
                syntheticOffer: p.syntheticOffer,
              });

              if (typeof p.totalPrice === 'number') {
                petsitterMap[p.id].total_allAnimals_price += p.totalPrice;
              }
            });
          });

          Object.values(petsitterMap).forEach(p => {
            p.total_allAnimals_price = Math.round(p.total_allAnimals_price * 100) / 100;
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

      const syntheticResponse = await axios.post(
        `${process.env.REACT_APP_API_BASE}/api/offer/synthetic/${petsitter.id}`,
        petsitter.syntheticOffers,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdOffers = syntheticResponse.data;

      petsitter.syntheticOffers = petsitter.syntheticOffers.map((offerItem) => {
        const match = createdOffers.find(
          (o) => parseInt(o.animalId) === parseInt(offerItem.animalId)
        );

        if (match) {
          offerItem.syntheticOffer.offerId = match.id;
        }

        return offerItem;
      });

      await axios.post(`${process.env.REACT_APP_API_BASE}/api/contract`, { 
        petsitter, 
        requestData
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate('/mes-contrats');
    } catch (error) {
      console.error("Erreur lors du chargement du contrat ou des offres :", error);
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

  // Application des filtres avec filtre par étoiles visuel (minRating)
  const filteredPetsitters = petsitters.filter(p => {
    return (
      (maxPrice === '' || p.total_allAnimals_price <= parseFloat(maxPrice)) &&
      (maxDistance === '' || p.distanceInKm <= parseFloat(maxDistance)) &&
      (minRating === 0 || (p.averageRating ?? 0) >= minRating)
    );
  });

  // Tri simple
  const sortedPetsitters = filteredPetsitters.sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'price':
        aValue = a.total_allAnimals_price;
        bValue = b.total_allAnimals_price;
        break;
      case 'distance':
        aValue = a.distanceInKm;
        bValue = b.distanceInKm;
        break;
      case 'rating':
        aValue = a.averageRating ?? 0;
        bValue = b.averageRating ?? 0;
        break;
      default:
        aValue = 0;
        bValue = 0;
    }
    if (sortOrder === 'asc') return aValue - bValue;
    return bValue - aValue;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1  className="text-2xl font-bold mb-6 inline-block w-auto border-b-4 border-green-500" style={{ color: 'var(--color-green-dark)' }}>Petsitters disponibles</h1>

      {/* Filtres */}
      <div className="bg-green-50 p-6 rounded-xl shadow-sm mb-6 flex flex-wrap gap-8 items-center">
        
        {/* Prix max */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-[var(--color-green-dark)]">Prix max (€)</label>
          <input
            type="number"
            placeholder="Prix max (€)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border border-green-200 px-3 py-2 rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            min="0"
          />
        </div>

        {/* Distance max */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-[var(--color-green-dark)]">Distance max (km)</label>
          <input
            type="number"
            placeholder="Distance max (km)"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            className="border border-green-200 px-3 py-2 rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            min="0"
          />
        </div>

        {/* Note minimale */}
        <div className="flex flex-col space-y-1 mb-2">
          <label className="font-semibold mb-2 text-[var(--color-green-dark)]">Note minimale</label>
          <StarFilter currentRating={minRating} onChange={setMinRating} />
        </div>

        {/* Tri */}
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col">
            <label htmlFor="sortBy" className="font-semibold mb-1 text-[var(--color-green-dark)]">Trier par</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-green-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            >
              <option value="price">Prix</option>
              <option value="distance">Distance</option>
              <option value="rating">Note</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="sortOrder" className="font-semibold mb-1 text-[var(--color-green-dark)]">Ordre</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="border border-green-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            >
              <option value="asc">Ascendant</option>
              <option value="desc">Descendant</option>
            </select>
          </div>
        </div>

      </div>

      {/* Résultats */}
 {sortedPetsitters.length === 0 ? (
        <p className="text-gray-600">Aucun petsitter ne correspond aux filtres.</p>
      ) : (
        <ul className="space-y-4">
          {sortedPetsitters.map((petsitter) => (
            <li
              key={petsitter.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md flex items-center justify-between gap-6 hover:shadow-lg transition-shadow duration-200"
            >
              {/* Infos à gauche */}
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold text-[var(--color-green-dark)]">
                  {petsitter.first_name} {petsitter.last_name}
                </h2>
                {petsitter.averageRating != null && (
                  <StarRating rating={petsitter.averageRating} />
                )}
              </div>

              {/* Prix */}
              <p className="px-3 py-1 mt-4 rounded-full bg-[var(--color-green-light)] text-[var(--color-green-dark)] font-semibold text-md shadow-md whitespace-nowrap">
                {petsitter.total_allAnimals_price} €
              </p>

              {/* Distance */}
              <p className="px-3 py-1 mt-4 rounded-full bg-[var(--color-blue-light)] text-[var(--color-blue-dark)] font-semibold text-md shadow-md whitespace-nowrap">
                {petsitter.distanceInKm} km
              </p>

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  className="btn-blue"
                  onClick={() => navigate(`/petsitter-profil/${petsitter.id}`)}
                >
                  Voir le profil
                </button>

                {isAuthenticated && (
                  <button
                    className="btn-green"
                    onClick={() => handleSelectPetsitter(petsitter)}
                  >
                    Choisir ce petsitter
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}