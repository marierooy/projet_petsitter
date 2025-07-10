import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Label } from 'components/ui/label';
import { AnimalTypeAccordion } from 'components/AnimalTypeAccordion';
import { createAnimalType, createOfferPayload } from 'utils/types';
import { useAnimalTypes } from 'utils/hooks';

export function ConfigurationPanel({ isVisible, selectedEvent, onClose }) {
  const configPanelRef = useRef(null);
  const { animalTypes, setAnimalTypes, allAnimalTypes, saveAllOffers } = useAnimalTypes(selectedEvent?.id);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [selectedServiceIndex, setSelectedServiceIndex] = useState({});
  const [selectedOccurrences, setSelectedOccurrences] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Scroll to panel when it becomes visible
  useEffect(() => {
    if (isVisible && configPanelRef.current) {
      setTimeout(() => {
        configPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isVisible]);

  // Initialize selected occurrences when animal types change
  useEffect(() => {
    const initialSelected = {};

    animalTypes.forEach(animal => {
      initialSelected[animal.id] = {};

      animal.services.forEach(service => {
        initialSelected[animal.id][service.id] = service.occurences.map(occ => {
          const prevOcc = selectedOccurrences?.[animal.id]?.[service.id]?.find(o => o.id === occ.id) || {};
          return {
            ...occ,
            checked: prevOcc.checked || occ.checked,
            price: prevOcc.price || occ.price,
          };
        });
      });
    });

    setSelectedOccurrences(initialSelected);
  }, [animalTypes]);

  const toggleAccordion = (index) => {
    setAnimalTypes(prev =>
      prev.map((animal, i) =>
        i === index ? { ...animal, isOpen: !animal.isOpen } : animal
      )
    );
  };

  const handleAddAnimal = () => {
    const selectedAnimal = allAnimalTypes.find(a => a.id === parseInt(selectedAnimalId, 10));
    if (!selectedAnimal) return;

    setAnimalTypes(prev => [
      ...prev,
      {
        id: selectedAnimal.id,
        name: selectedAnimal.name,
        services: selectedAnimal.services,
        allServices: selectedAnimal.allServices,
        isOpen: true // Open by default when added
      }
    ]);

    setSelectedAnimalId('');
  };

  const removeAnimalType = (indexToRemove) => {
    setAnimalTypes(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const updateCareMode = (index, mode, value) => {
    setAnimalTypes(prev =>
      prev.map((animal, i) =>
        i === index
          ? {
              ...animal,
              careModes: {
                ...animal.careModes,
                [mode]: value,
              },
            }
          : animal
      )
    );
  };

  const updateAnimalField = (index, field, value) => {
    setAnimalTypes(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const toggleOccurrenceChecked = (animalId, serviceId, occId) => {
    setSelectedOccurrences(prev => {
      const animal = { ...(prev[animalId] || {}) };
      const serviceOccurrences = [...(animal[serviceId] || [])];

      const occIndex = serviceOccurrences.findIndex(o => o.id === occId);
      if (occIndex !== -1) {
        serviceOccurrences[occIndex] = {
          ...serviceOccurrences[occIndex],
          checked: !serviceOccurrences[occIndex].checked,
        };
      } else {
        serviceOccurrences.push({ id: occId, checked: true, label: '', price: 0 });
      }

      return {
        ...prev,
        [animalId]: {
          ...animal,
          [serviceId]: serviceOccurrences,
        },
      };
    });
  };

  const updateOccurrencePrice = (animalId, serviceId, occId, newPrice) => {
    setSelectedOccurrences(prev => {
      const animal = prev[animalId] || {};
      const service = (animal[serviceId] || []).map(o =>
        o.id === occId ? { ...o, price: parseFloat(newPrice) || 0 } : o
      );
      return {
        ...prev,
        [animalId]: {
          ...animal,
          [serviceId]: service,
        },
      };
    });
  };

  const handleSelectService = (animalIdx, serviceId) => {
    setSelectedServiceIndex(prev => ({ ...prev, [animalIdx]: serviceId }));
  };

  const addSelectedService = (animalIdx) => {
    const serviceId = parseInt(selectedServiceIndex[animalIdx], 10);
    if (!serviceId) return;

    setAnimalTypes(prev => {
      const updated = [...prev];

      const alreadyAdded = updated[animalIdx].services?.some(s => s.id === serviceId);
      if (alreadyAdded) return prev;

      const selectedService = updated[animalIdx].allServices.find(s => s.id === serviceId);
      if (!selectedService) return prev;

      updated[animalIdx] = {
        ...updated[animalIdx],
        services: [
          ...(updated[animalIdx].services || []),
          {
            ...selectedService,
            occurences: selectedService.occurences?.map(o => ({ ...o })) || [],
          },
        ],
      };

      return updated;
    });

    setSelectedServiceIndex(prev => ({ ...prev, [animalIdx]: '' }));
  };

  const removeService = (index, serviceIndex) => {
    setAnimalTypes(prev =>
      prev.map((animal, i) =>
        i === index
          ? {
              ...animal,
              services: (animal.services || []).filter((_, j) => j !== serviceIndex),
            }
          : animal
      )
    );
  };

  const handleSaveAllOffers = async () => {
    if (!selectedEvent?.id) return;
    
    setIsSaving(true);
    const payload = animalTypes.map(animal => ({
      animalTypeId: animal.id,
      availabilityId: selectedEvent.id,
      careModes: animal.careModes || {},
      number_animals: animal.number_animals || 0,
      offer_price: animal.offer_price || 0,
      travel_price: animal.travel_price || 0,
      services: (animal.services || []).map(service => {
        const serviceOccurrences = selectedOccurrences?.[animal.id]?.[service.id] || [];

        return {
          id: service.id,
          occurences: serviceOccurrences.map(occ => ({
            id: occ.id,
            price: occ.price || 0,
            checked: occ.checked || false,
          }))
        };
      })
    }));

    try {
      await saveAllOffers(payload);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isVisible) return null;
  const availableAnimals = allAnimalTypes?.filter(animal => !animalTypes.some(a => a.id === animal.id))
   || [];
  const animalsOptions = availableAnimals.map(animal => ({
    value: animal.id.toString(),
    label: animal.name,
  }));
  console.log('aniamloptions',animalsOptions)
  return (
    <div ref={configPanelRef} className="mt-8 border-t pt-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold mb-6 text-gray-900">
          Paramétrage de la disponibilité
        </h3>

        {/* Animal Types List */}
        <div className="space-y-4 mb-6">
          {animalTypes.map((animal, index) => (
            <AnimalTypeAccordion
              key={animal.id}
              animal={animal}
              index={index}
              onToggle={toggleAccordion}
              onRemove={removeAnimalType}
              onUpdateCareMode={updateCareMode}
              onUpdateField={updateAnimalField}
              onRemoveService={removeService}
              onAddService={addSelectedService}
              onSelectService={handleSelectService}
              selectedServiceIndex={selectedServiceIndex}
              selectedOccurrences={selectedOccurrences}
              onToggleOccurrence={toggleOccurrenceChecked}
              onUpdateOccurrencePrice={updateOccurrencePrice}
            />
          ))}
        </div>

        {/* Add New Animal */}
        <div className="flex gap-3 items-end mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <Label className="text-sm font-medium text-gray-700">
              Ajouter un type d'animal
            </Label>
            {/* <Select value={selectedAnimalId} onChange={setSelectedAnimalId}>
              <SelectTrigger className="mt-1">
                <SelectValue value="-- Choisir un service --" />
              </SelectTrigger>
              <SelectContent>
                {allAnimalTypes
                  ?.filter(animal => !animalTypes.some(a => a.id === animal.id))
                  .map(animal => (
                    <SelectItem key={animal.id} value={animal.id.toString()}>
                      {animal.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select> */}
            <Select
              value={selectedAnimalId}
              onChange={setSelectedAnimalId}
              options={animalsOptions}
            >
              <SelectTrigger />
              <SelectContent>
                {animalsOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAddAnimal}
            disabled={!selectedAnimalId}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            + Ajouter
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white"
          >
            Fermer le paramétrage
          </Button>

          <Button
            onClick={handleSaveAllOffers}
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600 text-white px-6"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}