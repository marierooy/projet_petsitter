import React, { useEffect, useState } from 'react';
import axios from 'axios';

const groupAdvertsByDateRange = (adverts) => {
  const grouped = {};

  adverts.forEach((advert) => {
    const key = `${advert.startDate}__${advert.endDate}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(advert);
  });

  return grouped;
};

const AdvertsPage = () => {
  const [groupedAdverts, setGroupedAdverts] = useState({});
  const careModeLabels = {
    home: 'Garde à domicile',
    sitter: 'Garde chez le petsitter'
  };

  useEffect(() => {
    const getToken = () => localStorage.getItem('token');
    const token = getToken();
    const fetchAdverts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/advert/upcoming`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
        const grouped = groupAdvertsByDateRange(res.data);
        setGroupedAdverts(grouped);
      } catch (err) {
        console.error('Erreur lors du chargement des annonces', err);
      }
    };

    fetchAdverts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Annonces à venir</h1>

      {Object.entries(groupedAdverts).map(([dateKey, adverts]) => {
        const [start, end] = dateKey.split('__');
        return (
          <div key={dateKey} className="mb-6 border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Du {new Date(start).toLocaleDateString()} au {new Date(end).toLocaleDateString()}
            </h2>
            <p className="text-gray-600"><span className="font-semibold">Mode de garde : </span>{careModeLabels[adverts[0]?.careMode?.label]}</p>

            {adverts.map((advert) => (
              <div key={advert.id} className="mb-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
                <button
                    onClick={async () => {
                    const confirmed = window.confirm("Confirmer la suppression de l'annonce ?");
                    if (!confirmed) return;

                    try {
                        const token = localStorage.getItem('token');
                        await axios.delete(`${process.env.REACT_APP_API_BASE}/api/advert/${advert.id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                        });
                        // Recharger la liste après suppression
                        setGroupedAdverts((prev) => {
                        const updated = { ...prev };
                        const key = `${advert.startDate}__${advert.endDate}`;
                        updated[key] = updated[key].filter((a) => a.id !== advert.id);
                        if (updated[key].length === 0) delete updated[key];
                        return updated;
                        });
                    } catch (err) {
                        console.error('Erreur lors de la suppression', err);
                    }
                    }}
                    className="text-red-600 hover:underline text-sm"
                >
                    Supprimer
                </button>
                <p className="font-medium text-gray-600"><span className="font-semibold">Animal : </span>{advert.animal?.name || 'Inconnu'}</p>
                <div className="mt-2">
                  <h4 className="font-semibold">Services :</h4>
                  <ul className="list-disc list-inside">
                    {advert.advertServiceOccurences?.map((entry, i) => (
                      <li key={i}>
                        {entry.service?.label} ({entry.occurence?.label})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default AdvertsPage;