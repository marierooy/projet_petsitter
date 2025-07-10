import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ServiceOccurencePage() {
  const [services, setServices] = useState([]);
  const [occurences, setOccurences] = useState([]);
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  const [selectedOccurences, setSelectedOccurences] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchServices();
    fetchOccurences();
  }, []);

  const fetchServices = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/service`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const servicesData = res.data;
    setServices(servicesData);

    // Initialise selectedOccurences
    const initialSelected = {};
    for (const service of servicesData) {
      const resOcc = await axios.get(`${process.env.REACT_APP_API_BASE}/api/service/${service.id}/occurences`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      initialSelected[service.id] = {};
      if (Array.isArray(resOcc.data)) {
        resOcc.data.forEach(o => {
          initialSelected[service.id][o.id] = true;
        });
      } else {
        console.error('Données inattendues pour resOcc.data:', resOcc.data, service.id);
      }
    }

    setSelectedOccurences(initialSelected);
  };

  const fetchOccurences = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/occurence`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setOccurences(res.data);
  };

  const toggleAccordion = (serviceId) => {
    setExpandedServiceId(prev => (prev === serviceId ? null : serviceId));
  };

  const handleCheckboxChange = (serviceId, occurenceId) => {
    setSelectedOccurences(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [occurenceId]: !prev[serviceId]?.[occurenceId]
      }
    }));
  };

  const handleSave = async (serviceId) => {
    const selected = selectedOccurences[serviceId];
    const occurenceIds = Object.keys(selected).filter(id => selected[id]);

    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE}/api/service/${serviceId}/occurences`,
        { occurenceIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Enregistré avec succès');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l’enregistrement');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Associer les occurrences aux services</h2>
      {services.map(service => (
        <div key={service.id} className="mb-4 border rounded">
          <button
            onClick={() => toggleAccordion(service.id)}
            className="w-full text-left p-4 font-semibold bg-gray-100 hover:bg-gray-200"
          >
            {service.label}
          </button>
          {expandedServiceId === service.id && (
            <div className="p-4 bg-white">
              <div className="grid grid-cols-2 gap-2">
                {occurences.map(occ => (
                  <label key={occ.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selectedOccurences[service.id]?.[occ.id]}
                      onChange={() => handleCheckboxChange(service.id, occ.id)}
                    />
                    {occ.label}
                  </label>
                ))}
              </div>
              <button
                onClick={() => handleSave(service.id)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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

export default ServiceOccurencePage;