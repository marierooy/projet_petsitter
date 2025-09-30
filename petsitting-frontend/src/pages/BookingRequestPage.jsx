import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { AnimalAccordion } from 'components/AnimalAccordion';
import { useNavigate } from 'react-router-dom';
import { fetchCsrfToken } from '../utils/csrf';

export default function BookingRequestPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const userId = user?.id;

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [careModes, setCareModes] = useState([]);
  const [selectedCareMode, setSelectedCareMode] = useState('');
  const [animalTypes, setAnimalTypes] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [newAnimal, setNewAnimal] = useState({ name: '', type: '' });
  const [pendingAnimalId, setPendingAnimalId] = useState('');
  const [recentAdverts, setRecentAdverts] = useState([]);

  // Pour gérer les services sélectionnés par animal : { animalId: { serviceId: occurrenceId } }
  const [selectedServices, setSelectedServices] = useState({});

  // Pour gérer les animaux ouverts (accordéon)
  const [expandedAnimals, setExpandedAnimals] = useState({});

  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const [errors, setErrors] = useState([]);

  const navigate = useNavigate();

  const [csrfToken, setCsrfToken] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const errorRef = useRef(null);

  useEffect(() => {
    // 🔹 Charger le CSRF token au montage
    const fetchCsrf = async () => {
      const token = await fetchCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrf();
  }, []);

  // ✅ scroll automatique quand des erreurs apparaissent
  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [errors]);

  // Chargement initial
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE}/api/care-mode`, {
      withCredentials: true,
      headers: { "X-CSRF-Token": csrfToken },
    }).then(res => {
      const mappedCareModes = res.data.map(careMode => {
        let label = '';
        if (careMode.label === 'home') label = 'Garde à domicile';
        else if (careMode.label === 'sitter') label = 'Garde chez le petsitter';
        else label = careMode.label;
        return { ...careMode, label };
      });
      setCareModes(mappedCareModes);
    });

    axios.get(`${process.env.REACT_APP_API_BASE}/api/animal-type`, {
      withCredentials: true,
      headers: { "X-CSRF-Token": csrfToken },
    }).then(res => setAnimalTypes(res.data));

    if (isAuthenticated && userId) {
      axios.get(`${process.env.REACT_APP_API_BASE}/api/animal/services/occurences`, {
      withCredentials: true,
      headers: { "X-CSRF-Token": csrfToken },
    }).then(res => setAnimals(res.data));
      axios.get(`${process.env.REACT_APP_API_BASE}/api/advert/recent`, {
      withCredentials: true,
      headers: { "X-CSRF-Token": csrfToken },
    }).then(res => setRecentAdverts(res.data));
    }
  }, [isAuthenticated, userId, csrfToken]);

  // Fonctions pour gérer l'état sélectionné
  const handleToggle = (animalId) => {
    setExpandedAnimals(prev => ({
      ...prev,
      [animalId]: !prev[animalId]
    }));
  };

  const handleRemoveAnimal = (animalId) => {
    setSelectedServices(prev => {
      const updated = { ...prev };
      delete updated[animalId];
      return updated;
    });
    if (selectedAnimalId === animalId) {
      setSelectedAnimalId('');
    }
    setExpandedAnimals(prev => {
      const updated = { ...prev };
      delete updated[animalId];
      return updated;
    });
  };

  const handleAddService = (animalId, serviceId) => {
    setSelectedServices(prev => ({
      ...prev,
      [animalId]: {
        ...(prev[animalId] || {}),
        [String(serviceId)]: null
      }
    }));
  };

  const handleRemoveService = (animalId, serviceId) => {
    setSelectedServices(prev => {
      const updated = { ...prev };
      if (updated[animalId]) {
        delete updated[animalId][String(serviceId)];
      }
      return updated;
    });
  };

  const handleSelectOccurrence = (animalId, serviceId, occurenceId) => {
    setSelectedServices(prev => ({
      ...prev,
      [animalId]: {
        ...(prev[animalId] || {}),
        [String(serviceId)]: occurenceId
      }
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async () => {
    const validationErrors = [];

    if (!startDate || !endDate || !selectedCareMode) {
      validationErrors.push('Veuillez remplir toutes les dates et sélectionner un mode de garde.');
    }

    if (!isAuthenticated) {
      if (!address || !postalCode || !city || !country) {
        validationErrors.push('Veuillez renseigner votre adresse complète.');
      }
    }

    if (!Object.keys(selectedServices).length) {
      validationErrors.push("Veuillez ajouter au moins un animal à la demande.");
    }

    for (const [animalId, serviceMap] of Object.entries(selectedServices)) {
      for (const [serviceId, occurrenceId] of Object.entries(serviceMap)) {
        if (!occurrenceId) {
          const animal = animals.find(a => a.id.toString() === animalId);
          const service = animal?.services?.find(s => s.id.toString() === serviceId);
          validationErrors.push(
            `Veuillez sélectionner une occurrence pour le service "${service?.label || serviceId}" de l’animal ${animal?.name || ''}`
          );
        }
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setErrors([]);
      const selectedAnimals = animals.filter(animal => expandedAnimals[animal.id]);
      const countsByType = {};
      selectedAnimals.forEach(({ animalTypeId }) => {
        countsByType[animalTypeId] = (countsByType[animalTypeId] || 0) + 1;
      });
      const advertsPayload = Object.entries(selectedServices).map(([animalId, serviceMap]) => {
        const animal = animals.find(a => a.id.toString() === animalId);
        if (!animal) return null;

        const services = Object.entries(serviceMap)
          .filter(([, occurrenceId]) => occurrenceId !== null && occurrenceId !== '')
          .map(([serviceId, occurrenceId]) => ({
            serviceId: parseInt(serviceId, 10),
            occurrenceId: parseInt(occurrenceId, 10),
          }));

        return {
          startDate,
          endDate,
          careModeId: selectedCareMode,
          animalId: animal.id,
          numberAnimalsPerType: countsByType[animal.animalTypeId],
          userId,
          services,
          ...(isAuthenticated ? {} : {
          ownerAddressInput: {
            address,
            postalCode,
            city,
            country
          }
        })
        };
      }).filter(Boolean);

      if (isAuthenticated) {
        for (let i = 0; i < advertsPayload.length; i++) {
          const advert = advertsPayload[i];
          const response = await axios.post(`${process.env.REACT_APP_API_BASE}/api/advert`, advert, {
            withCredentials: true,
            headers: { "X-CSRF-Token": csrfToken },
          });

          const createdAdvert = response.data;
          advertsPayload[i].advertId = createdAdvert.id;
        }       
      }

      navigate('/matching-results', { state: advertsPayload });
      // reset si souhaité
    } catch (error) {
      console.error(error);
      setErrors(["Erreur lors de l’envoi des demandes."]);
    }
  };


  return (
    <div className="min-h-screen container flex justify-center items-start p-6">
        <div className="w-[650px] max-w-4xl bg-white shadow-lg rounded-2xl p-8 space-y-8">
        <h1 className="text-2xl font-bold inline-block w-auto border-b-4 border-green-500" style={{ color: 'var(--color-green-dark)' }}>Demande de garde</h1>

        {/* ✅ Affichage des erreurs */}
        {errors.length > 0 && (
          <div ref={errorRef} className="bg-red-100 text-red-700 p-3 rounded-lg space-y-1">
            {errors.map((err, idx) => (
              <p key={idx}>⚠️ {err}</p>
            ))}
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="labelForm">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="inputForm"
              min={today}
            />
          </div>
          <div>
            <label className="labelForm">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="inputForm"
              min={startDate || today}
            />
          </div>
        </div>

        {/* Mode de garde */}
        <div>
          <label className="labelForm">Mode de garde</label>
          <select
            value={selectedCareMode}
            onChange={e => setSelectedCareMode(e.target.value)}
            className="inputForm"
          >
            <option value="">Sélectionner un mode de garde</option>
            {careModes.map(mode => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        {/* Adresse si pas authentifié */}
        {!isAuthenticated && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="labelForm">Adresse</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="inputForm"
              />
            </div>
            <div>
              <label className="labelForm">Code postal</label>
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                className="inputForm"
              />
            </div>
            <div>
              <label className="labelForm">Ville</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="inputForm"
              />
            </div>
            <div className="col-span-2">
              <label className="labelForm">Pays</label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="inputForm"
              />
            </div>
          </div>
        )}

        {/* Animal */}
        <div>
          <label className="labelForm">Animaux</label>
          {isAuthenticated ? (
            <div className="flex flex-wrap space-x-2 items-center">
              <select
                value={pendingAnimalId}
                onChange={e => setPendingAnimalId(e.target.value)}
                className="select-animal inputForm sm:flex-[7]"
              >
                <option value="">Sélectionner un animal</option>
                {animals
                  .filter(animal => !(animal.id in selectedServices))
                  .map(animal => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                disabled={!pendingAnimalId}
                className={`px-4 py-2 sm:flex-[3] rounded text-white ${
                  pendingAnimalId ? 'btn-blue' : 'btn-gray !bg-gray-300 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (!pendingAnimalId) {
                    alert('Veuillez sélectionner un animal');
                    return;
                  }
                  const selectedAnimal = animals.find(a => a.id.toString() === pendingAnimalId);
                  if (!selectedAnimal) return;

                  setSelectedAnimalId(pendingAnimalId);
                  setExpandedAnimals(prev => ({
                    ...prev,
                    [pendingAnimalId]: true,
                  }));

                  const recent = recentAdverts.find(a => a.animalId === selectedAnimal.id);
                  let defaultServices = {};

                  if (recent) {
                    recent.serviceOccurrences.forEach(s => {
                      defaultServices[s.serviceId] = s.occurrenceId;
                    });
                  } else {
                    selectedAnimal.services?.forEach(service => {
                      defaultServices[service.id] = '';
                    });
                  }

                  setSelectedServices(prev => ({
                    ...prev,
                    [pendingAnimalId]: defaultServices
                  }));
                  setPendingAnimalId('');
                }}
              >
                + Ajouter cet animal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder="Nom de l'animal"
                value={newAnimal.name}
                onChange={e => setNewAnimal({ ...newAnimal, name: e.target.value })}
                className="inputForm"
              />
              <select
                value={newAnimal.type}
                onChange={e => setNewAnimal({ ...newAnimal, type: e.target.value })}
                className="inputForm"
              >
                <option value="">Type d'animal</option>
                {animalTypes.map(type => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`px-4 py-2 rounded text-white ${
                    newAnimal.name && newAnimal.type ? 'btn-blue' : 'btn-gray !bg-gray-300 cursor-not-allowed'
                }`}
                onClick={async () => {
                  if (!newAnimal.name || !newAnimal.type) {
                    alert('Veuillez renseigner un nom et un type d’animal.');
                    return;
                  }

                  try {
                    const res = await axios.get(
                      `${process.env.REACT_APP_API_BASE}/api/animal-type/services/occurences?label=${newAnimal.type}`
                    );

                    const animalToAdd = res.data;
                    const tempId = `temp-${Date.now()}`;
                    animalToAdd.id = tempId;
                    animalToAdd.name = newAnimal.name;
                    animalToAdd.animalType = newAnimal.type;

                    setAnimals(prev => [...prev, animalToAdd]);
                    setSelectedAnimalId(tempId);
                    setExpandedAnimals(prev => ({ ...prev, [tempId]: true }));

                    const defaultServices = {};
                    animalToAdd.services.forEach(service => {
                      defaultServices[service.id] = '';
                    });
                    setSelectedServices(prev => ({
                      ...prev,
                      [tempId]: defaultServices
                    }));

                    setNewAnimal({ name: '', type: '' });
                  } catch (error) {
                    console.error(error);
                    alert("Erreur lors du chargement des services pour ce type d’animal.");
                  }
                }}
              >
                + Ajouter cet animal
              </button>
            </div>
          )}
        </div>

        {/* Liste des animaux ajoutés */}
        {Object.keys(selectedServices).map(animalId => {
          const animal = animals.find(a => a.id.toString() === animalId);
          if (!animal) return null;

          return (
            <div key={animalId} className="border rounded-xl p-4 my-4 relative">
              <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:scale-110"
                onClick={() => handleRemoveAnimal(animal.id)}
              >
                ❌
              </button>

              <AnimalAccordion
                animal={animal}
                selectedServiceIndex={selectedServices[animal.id] || {}}
                onAddService={(serviceId) => handleAddService(animal.id, serviceId)}
                onRemoveService={(serviceId) => handleRemoveService(animal.id, serviceId)}
                onSelectOccurrence={(serviceId, occurrenceId) =>
                  handleSelectOccurrence(animal.id, serviceId, occurrenceId)
                }
                allServices={animal.allServices || []}
              />
            </div>
          );
        })}

        <button type="button" className="btn-blue" onClick={handleSubmit}>
          Envoyer la demande
        </button>
      </div>
    </div>
  );
}