import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchCsrfToken } from '../utils/csrf';

function AnimalServicesPage() {
  const [animalTypes, setAnimalTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [expandedAnimalId, setExpandedAnimalId] = useState(null);
  const [selectedServices, setSelectedServices] = useState({});
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    const init = async () => {
      const token = await fetchCsrfToken();
      setCsrfToken(token);
      fetchAnimals(token);
      fetchServices(token);
    };
    init();
  }, []);

  const fetchAnimals = async (token) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/animal-type`, {
      withCredentials: true,
      headers: { "X-CSRF-Token": token }
    });

    const types = res.data;
    const selected = {};

    for (const type of types) {
      const resServices = await axios.get(`${process.env.REACT_APP_API_BASE}/api/animal-type/${type.id}/services`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": token }
      });

      selected[type.id] = {};
      resServices.data.forEach(service => {
        selected[type.id][service.id] = true;
      });
    }

    setAnimalTypes(types);
    setSelectedServices(selected);
  };

  const fetchServices = async (token) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/service`, {
      withCredentials: true,
      headers: { "X-CSRF-Token": token }
    });
    setServices(res.data);
  };

  const toggleAccordion = (animalId) => {
    setExpandedAnimalId(prev => (prev === animalId ? null : animalId));
  };

  const handleCheckboxChange = (animalTypeId, serviceId) => {
    setSelectedServices(prev => ({
      ...prev,
      [animalTypeId]: {
        ...prev[animalTypeId],
        [serviceId]: !prev[animalTypeId]?.[serviceId]
      }
    }));
  };

  const handleSaveServices = async (animalTypeId) => {
    if (!csrfToken) return;

    const selected = selectedServices[animalTypeId];
    const serviceIds = Object.keys(selected).filter(id => selected[id]);

    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE}/api/animal-type/${animalTypeId}/services`,
        { serviceIds },
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken }
        }
      );
      alert("Services enregistrés.");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Choisissez les services pour les types d'animaux</h2>
      {animalTypes.map(animalType => (
        <div
          key={animalType.id}
          className="mb-5 border border-gray-300 rounded-lg shadow-sm overflow-hidden"
        >
          <button
            onClick={() => toggleAccordion(animalType.id)}
            className="w-full text-left p-5 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold text-green-800 flex justify-between items-center transition"
            aria-expanded={expandedAnimalId === animalType.id}
          >
            <span>{animalType.name}</span>
            <svg
              className={`w-5 h-5 transform transition-transform duration-300 ${expandedAnimalId === animalType.id ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {expandedAnimalId === animalType.id && (
            <div className="p-6 bg-white border-t border-gray-200">
              <p className="mb-3 text-gray-700 font-medium">Services disponibles :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-h-64 overflow-auto">
                {services.map(service => (
                  <label
                    key={service.id}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedServices[animalType.id]?.[service.id]}
                      onChange={() => handleCheckboxChange(animalType.id, service.id)}
                      className="form-checkbox h-5 w-5 text-green-600 transition duration-150 ease-in-out"
                    />
                    <span className="text-gray-800">{service.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={() => handleSaveServices(animalType.id)}
                className="inline-block px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              >
                Enregistrer
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AnimalServicesPage;
