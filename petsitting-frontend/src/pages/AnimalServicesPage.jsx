import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AnimalServicesPage() {
  const [animalTypes, setAnimalTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [expandedAnimalId, setExpandedAnimalId] = useState(null);
  const [selectedServices, setSelectedServices] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAnimals();
    fetchServices();
  }, []);

  const fetchAnimals = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/animal-type`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const types = res.data;
    const selected = {};

    for (const type of types) {
      const resServices = await axios.get(`${process.env.REACT_APP_API_BASE}/api/animal-type/${type.id}/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      selected[type.id] = {};
      resServices.data.forEach(service => {
        selected[type.id][service.id] = true;
      });
    }

    setAnimalTypes(types);
    setSelectedServices(selected);
  };

  const fetchServices = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/service`, {
      headers: { Authorization: `Bearer ${token}` }
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
    const selected = selectedServices[animalTypeId];
    const serviceIds = Object.keys(selected).filter(id => selected[id]);

    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE}/api/animal-type/${animalTypeId}/services`,
        { serviceIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Services enregistrés.');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Choisissez les services pour les types d'animaux</h2>
      {animalTypes.map(animalType => (
        <div key={animalType.id} className="mb-4 border rounded">
          <button
            onClick={() => toggleAccordion(animalType.id)}
            className="w-full text-left p-4 font-semibold bg-gray-100 hover:bg-gray-200"
          >
            {animalType.name}
          </button>
          {expandedAnimalId === animalType.id && (
            <div className="p-4 bg-white">
              <p className="mb-2 text-gray-600">Services :</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {services.map(service => (
                  <label key={service.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selectedServices[animalType.id]?.[service.id]}
                      onChange={() => handleCheckboxChange(animalType.id, service.id)}
                    />
                    {service.label}
                  </label>
                ))}
              </div>

              {/* 🔽 Ajoute ce bouton ici 🔽 */}
              <button
                onClick={() => handleSaveServices(animalType.id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
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
