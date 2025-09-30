import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchCsrfToken } from '../utils/csrf';

function ServiceOccurencePage() {
  const [services, setServices] = useState([]);
  const [occurences, setOccurences] = useState([]);
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  const [selectedOccurences, setSelectedOccurences] = useState({});
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const init = async () => {
      const token = await fetchCsrfToken();
      setCsrfToken(token);
      await fetchServices(token);
      await fetchOccurences(token);
    };
    init();
  }, []);

  const fetchServices = async (csrf) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/service`, {
      withCredentials: true,
      headers: { "X-CSRF-Token": csrf }
    });

    const servicesData = res.data;
    setServices(servicesData);

    const initialSelected = {};
    for (const service of servicesData) {
      const resOcc = await axios.get(`${process.env.REACT_APP_API_BASE}/api/service/${service.id}/occurences`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrf }
      });
      initialSelected[service.id] = {};
      if (Array.isArray(resOcc.data)) {
        resOcc.data.forEach(o => {
          initialSelected[service.id][o.id] = true;
        });
      }
    }
    setSelectedOccurences(initialSelected);
  };

  const fetchOccurences = async (csrf) => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/occurence`, {
      withCredentials: true,
      headers: { "X-CSRF-Token": csrf }
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
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken }
        }
      );
      alert('Enregistré avec succès');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l’enregistrement');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">
        Associer les occurrences aux services
      </h2>

      {services.map(service => (
        <div
          key={service.id}
          className="mb-5 border border-gray-300 rounded-lg shadow-sm overflow-hidden"
        >
          <button
            onClick={() => toggleAccordion(service.id)}
            className="w-full text-left p-5 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold text-green-800 flex justify-between items-center transition"
            aria-expanded={expandedServiceId === service.id}
          >
            <span>{service.label}</span>
            <svg
              className={`w-5 h-5 transform transition-transform duration-300 ${
                expandedServiceId === service.id ? 'rotate-180' : ''
              }`}
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

          {expandedServiceId === service.id && (
            <div className="p-6 bg-white border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-auto">
                {occurences.map(occ => (
                  <label
                    key={occ.id}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedOccurences[service.id]?.[occ.id]}
                      onChange={() => handleCheckboxChange(service.id, occ.id)}
                      className="form-checkbox h-5 w-5 text-green-600 transition duration-150 ease-in-out"
                    />
                    <span className="text-gray-800">{occ.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={() => handleSave(service.id)}
                className="mt-6 inline-block px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
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