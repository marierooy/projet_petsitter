import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Select, SelectTrigger, SelectContent, SelectItem
} from 'components/ui/select';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { AnimalAccordion } from 'components/AnimalAccordion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookingRequestPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const userId = user?.id;
  const token = user?.token;

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

  const navigate = useNavigate();

  const careModeOptions = careModes.map(careMode => ({
    value: careMode.id.toString(),
    label: careMode.label,
  }));

  const animalOptions = animals.filter(animal => !(animal.id in selectedServices)).map(animal => ({
    value: animal.id.toString(),
    label: animal.name,
  }));

  const animalTypeOptions = animalTypes.map(animalType => ({
    value: animalType.name,
    label: animalType.name,
  }));

  // Chargement initial
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE}/api/care-mode`).then(res => {
      const mappedCareModes = res.data.map(careMode => {
        let label = '';
        if (careMode.label === 'home') label = 'Garde à domicile';
        else if (careMode.label === 'sitter') label = 'Garde chez le petsitter';
        else label = careMode.label;
        return { ...careMode, label };
      });
      setCareModes(mappedCareModes);
    });

    axios.get(`${process.env.REACT_APP_API_BASE}/api/animal-type`).then(res => setAnimalTypes(res.data));

    if (isAuthenticated && userId) {
      axios.get(`${process.env.REACT_APP_API_BASE}/api/animal/services/occurences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }).then(res => setAnimals(res.data));
      axios.get(`${process.env.REACT_APP_API_BASE}/api/advert/recent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(res => setRecentAdverts(res.data));
    }
  }, [isAuthenticated, userId, token]);

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
    if (!startDate || !endDate || !selectedCareMode) {
      alert('Veuillez remplir toutes les dates et sélectionner un mode de garde.');
      return;
    }

    if (!Object.keys(selectedServices).length) {
      alert("Veuillez ajouter au moins un animal à la demande.");
      return;
    }

    try {
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
          userId, // ou propriétaire = user.id
          services,
        };
      }).filter(Boolean); // Supprimer les null si animal non trouvé

      for (let i = 0; i < advertsPayload.length; i++) {
        const advert = advertsPayload[i];
        const response = await axios.post(`${process.env.REACT_APP_API_BASE}/api/advert`, advert, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        const createdAdvert = response.data; // on suppose que l'API renvoie l'objet advert avec son id
        // Ajoute l'id dans l'objet original pour pouvoir l'utiliser ensuite
        advertsPayload[i].advertId = createdAdvert.id;
      }

      alert('Demandes envoyées !');
      navigate('/matching-results', { state: advertsPayload });
      // reset si souhaité
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l’envoi des demandes.');
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Demande de garde</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Date de début</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>Date de fin</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label>Mode de garde</label>
        <Select value={selectedCareMode} onChange={setSelectedCareMode} options={careModeOptions}>
          <SelectTrigger />
          <SelectContent>
            {careModes.map(mode => (
              <SelectItem key={mode.id} value={mode.id.toString()}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label>Animal</label>
        {isAuthenticated ? (
          <div className="flex space-x-2 items-center">
            <Select
              value={pendingAnimalId}
              onChange={(id) => setPendingAnimalId(id)}
              options={animalOptions}
              className="flex-[2]"
            >
              <SelectTrigger />
              <SelectContent>
                {animals
                  .filter(animal => !(animal.id in selectedServices))
                  .map(animal => (
                    <SelectItem key={animal.id} value={animal.id.toString()}>
                      {animal.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              className="flex-[1]"
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

                // Chercher les données de l'annonce récente correspondante
                const recent = recentAdverts.find(a => a.animalId === selectedAnimal.id);
                let defaultServices = {};

                // S’il y a une annonce récente, préremplir les services + occurrences
                if (recent) {
                  recent.serviceOccurrences.forEach(s => {
                    defaultServices[s.serviceId] = s.occurrenceId;
                  });
                } else {
                  // Sinon, juste les services sans occurrence
                  selectedAnimal.services?.forEach(service => {
                    defaultServices[service.id] = '';
                  });
                }

                setSelectedServices(prev => ({
                  ...prev,
                  [pendingAnimalId]: defaultServices
                }));
                setPendingAnimalId(''); // Réinitialise après ajout
              }}
            >
              + Ajouter cet animal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Nom de l'animal"
              value={newAnimal.name}
              onChange={e => setNewAnimal({ ...newAnimal, name: e.target.value })}
            />
            <Select
              value={newAnimal.type}
              onChange={(value) => setNewAnimal({ ...newAnimal, type: value })}
              options={animalTypeOptions}
            >
              <SelectTrigger />
              <SelectContent>
                {animalTypes.map(type => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={async () => {
                if (!newAnimal.name || !newAnimal.type) {
                  alert('Veuillez renseigner un nom et un type d’animal.');
                  return;
                }

                try {
                  // Appel API pour récupérer les services liés au type
                  const res = await axios.get(
                    `${process.env.REACT_APP_API_BASE}/api/animal-type/services/occurences?label=${newAnimal.type}`);

                  const animalToAdd = res.data;

                  // Générer un ID temporaire (par ex. un timestamp ou UUID si besoin)
                  const tempId = `temp-${Date.now()}`;

                  animalToAdd.id = tempId;
                  animalToAdd.name = newAnimal.name;
                  animalToAdd.animalType = newAnimal.type;

                  setAnimals(prev => [...prev, animalToAdd]);

                  setSelectedAnimalId(tempId);
                  setExpandedAnimals(prev => ({ ...prev, [tempId]: true }));

                  const defaultServices = {};
                  animalToAdd.services.forEach(service => {
                    defaultServices[service.id] = ''; // fréquence non encore choisie
                  });
                  setSelectedServices(prev => ({
                    ...prev,
                    [tempId]: defaultServices
                  }));

                  // Reset du formulaire
                  setNewAnimal({ name: '', type: '' });
                } catch (error) {
                  console.error(error);
                  alert("Erreur lors du chargement des services pour ce type d’animal.");
                }
              }}
            >
              + Ajouter cet animal
            </Button>
          </div>      
        )}
      </div>

      {Object.keys(selectedServices).map(animalId => {
        const animal = animals.find(a => a.id.toString() === animalId);
        if (!animal) return null;

        return (
          <div key={animalId} className="border rounded p-4 my-4 relative">
            <button
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              onClick={() => handleRemoveAnimal(animal.id)}
            >
              <X />
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

      <Button onClick={handleSubmit}>Envoyer la demande</Button>
    </div>
  );
}