import React, { useState, useEffect } from 'react';
import { Button } from 'components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Label } from 'components/ui/label';
import { AnimalTypeAccordion } from 'components/AnimalTypeAccordion';
import { createAnimalType, createOfferPayload } from 'utils/types';
import { useAnimalTypes } from 'utils/hooks';

export function ConfigurationPanel({ isVisible, selectedEvent, onClose }) {
  const { animalTypes, setAnimalTypes, selectedOccurrences, setSelectedOccurrences, allAnimalTypes, saveAllOffers } = useAnimalTypes(selectedEvent?.id);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [selectedServiceIndex, setSelectedServiceIndex] = useState({});
  // const [selectedOccurrences, setSelectedOccurrences] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [occurrenceVersion, setOccurrenceVersion] = useState(0);

  // useEffect(() => {
  //   const initialSelected = {};
  //   animalTypes.forEach(animal => {
  //     initialSelected[animal.id] = {};
  //     animal.services.forEach(service => {
  //       initialSelected[animal.id][service.id] = service.occurences.map(occ => {
  //         // const prevOcc = selectedOccurrences?.[animal.id]?.[service.id]?.find(o => o.id === occ.id) || {};
  //         // return {
  //         //   ...occ,
  //         //   checked: prevOcc.checked || occ.checked,
  //         //   price: prevOcc.price || occ.price,
  //         // };
  //         return {
  //           ...occ,
  //           checked: occ.checked,
  //           price: occ.price,
  //         };
  //       });
  //     });
  //   });
  //   setSelectedOccurrences(initialSelected);
  //   setOccurrenceVersion(v => v + 1);
  // }, [animalTypes]);

  // const [dataHasBeenInitialized, setDataHasBeenInitialized] = useState(false);

  // useEffect(() => {
  //   console.log('useEffectAnimalTypes',animalTypes);
  //   console.log('useEffectdataHasBeenInitialized',dataHasBeenInitialized);
  //   if (!animalTypes || animalTypes.length === 0 || dataHasBeenInitialized) return;

  //   const initialSelected = {};

  //   animalTypes.forEach(animal => {
  //     initialSelected[animal.id] = {};

  //     animal.services.forEach(service => {
  //       initialSelected[animal.id][service.id] = service.occurences.map(occ => ({
  //         id: occ.id,
  //         checked: occ.checked ?? false,
  //         price: occ.price ?? 0,
  //       }));
  //     });
  //   });

  //   setSelectedOccurrences(initialSelected);
  //   setDataHasBeenInitialized(true); // pour ne pas le refaire à chaque modif
  // }, [animalTypes, dataHasBeenInitialized]);

  // useEffect(() => {
  //   setDataHasBeenInitialized(false);
  // }, [selectedEvent?.id]);

  const toggleAccordion = (animalId) => {
    setAnimalTypes(prev =>
      prev.map(animal =>
        animal.id === animalId ? { ...animal, isOpen: !animal.isOpen } : animal
      )
    );
  };

  const onApplyServiceToAllAnimals = (serviceId, fromAnimalId) => {
    const sourceAnimal = animalTypes.find((a) => a.id === fromAnimalId);
    if (!sourceAnimal) return;

    const serviceInSource = sourceAnimal.services.find((s) => s.id === serviceId);
    if (!serviceInSource) return;

    setSelectedOccurrences(prevSelectedOccurrences => {
      const sourceOccurrences = prevSelectedOccurrences?.[fromAnimalId]?.[serviceId] || [];

      const confirmApply = window.confirm(
        `Appliquer les paramètres du service "${serviceInSource.label}" de ${sourceAnimal.name} à tous les autres animaux ?`
      );
      if (!confirmApply) return prevSelectedOccurrences; // on ne change rien

      const newSelectedOccurrences = {};

      animalTypes.forEach((animal) => {
        const animalId = animal.id;
        const currentAnimalOccurrences = prevSelectedOccurrences?.[animalId] || {};

        let updatedOccurrences = { ...currentAnimalOccurrences }; // copie systématique

        if (animalId !== fromAnimalId) {
          const hasSameService = animal.allServices?.some((s) => s.id === serviceId);
          if (hasSameService) {
            updatedOccurrences[serviceId] = sourceOccurrences.map((occ) => ({
              id: occ.id,
              checked: occ.checked,
              price: occ.price,
            }));
            const serviceToInject = animal.allServices.find(s => s.id === serviceId);
            animal.services = [
              ...(animal.services?.filter(s => s.id !== serviceId) || []),
              serviceToInject,
            ];
          }
        }
        newSelectedOccurrences[animalId] = updatedOccurrences;
      });
      return newSelectedOccurrences;
    });

    // setOccurrenceVersion(v => v + 1);
  };

  const onApplyOfferToAllAnimals = (fromAnimalId) => {
    const source = animalTypes.find(a => a.id === fromAnimalId);
    if (!source) return;

    const confirmCopy = window.confirm(
      `Appliquer le mode de garde, prix des prestations et déplacements, et nombre d'animaux maximum de ${source.name} à tous les autres ?`
    );
    if (!confirmCopy) return;

    setAnimalTypes(prev =>
      prev.map(animal => {
        if (animal.id === fromAnimalId) return animal; // ne modifie pas l’animal source

        return {
          ...animal,
          careModes: source.careModes,
          offer_price: source.offer_price,
          travel_price: source.travel_price,
          number_animals: source.number_animals,
        };
      })
    );
    // setOccurrenceVersion(v => v + 1);
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
        isOpen: true,
      }
    ]);
    setSelectedAnimalId('');
  };

  const removeAnimalType = (animalIdToRemove) => {
    setAnimalTypes(prev => prev.filter(animal => animal.id !== animalIdToRemove));
  };

  const updateCareMode = (animalId, mode, value) => {
    setAnimalTypes(prev =>
      prev.map(animal =>
        animal.id === animalId
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

  const updateAnimalField = (animalId, field, value) => {
    setAnimalTypes(prev =>
      prev.map(animal =>
        animal.id === animalId
          ? { ...animal, [field]: value }
          : animal
      )
    );
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
    // setOccurrenceVersion(v => v + 1);
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
    // setOccurrenceVersion(v => v + 1);
  };

  const handleSelectService = (animalId, serviceId) => {
    setSelectedServiceIndex(prev => ({ ...prev, [animalId]: serviceId }));
  };

  const addSelectedService = (animalId) => {
    const serviceId = parseInt(selectedServiceIndex[animalId], 10);
    if (!serviceId) return;

    setAnimalTypes(prev =>
      prev.map(animal => {
        if (animal.id !== animalId) return animal;
        const alreadyAdded = animal.services?.some(s => s.id === serviceId);
        if (alreadyAdded) return animal;

        const selectedService = animal.allServices.find(s => s.id === serviceId);
        if (!selectedService) return animal;

        return {
          ...animal,
          services: [
            ...(animal.services || []),
            {
              ...selectedService,
              occurences: selectedService.occurences?.map(o => ({ ...o })) || [],
            },
          ],
        };
      })
    );

    setSelectedServiceIndex(prev => ({ ...prev, [animalId]: '' }));
  };

  const removeService = (animalId, serviceId) => {
    setAnimalTypes(prev =>
      prev.map(animal =>
        animal.id === animalId
          ? {
              ...animal,
              services: (animal.services || []).filter(s => s.id !== serviceId),
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
          })),
        };
      }),
    }));

    try {
      await saveAllOffers(payload);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isVisible) return null;

  const availableAnimals = allAnimalTypes?.filter(animal => !animalTypes.some(a => a.id === animal.id)) || [];
  const animalsOptions = availableAnimals.map(animal => ({
    value: animal.id.toString(),
    label: animal.name,
  }));

  return (
    <div className="mt-8 border-t pt-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold mb-6 text-gray-900">
          Paramétrage de la disponibilité du {selectedEvent?.start?.toLocaleDateString()} au  {selectedEvent?.end?.toLocaleDateString()}
        </h3>

        <div className="space-y-4 mb-6">
          {animalTypes.map(animal => (
            <AnimalTypeAccordion
              key={animal.id}
              animal={animal}
              onToggle={(animalId) => toggleAccordion(animalId)}
              onRemove={(animalId) => removeAnimalType(animalId)}
              onUpdateCareMode={(animalId, mode, value) => updateCareMode(animalId, mode, value)}
              onUpdateField={(animalId, field, value) => updateAnimalField(animalId, field, value)}
              onRemoveService={(animalId, serviceId) => removeService(animalId, serviceId)}
              onAddService={(animalId) => addSelectedService(animalId)}
              onSelectService={(animalId, serviceId) => handleSelectService(animalId, serviceId)}
              selectedServiceIndex={selectedServiceIndex}
              selectedOccurrences={selectedOccurrences}
              onToggleOccurrence={(animalId, serviceId, occId) => toggleOccurrenceChecked(animalId, serviceId, occId)}
              onUpdateOccurrencePrice={(animalId, serviceId, occId, price) => updateOccurrencePrice(animalId, serviceId, occId, price)}
              onApplyServiceToAllAnimals={(serviceId, fromAnimalId) => onApplyServiceToAllAnimals(serviceId, fromAnimalId)}
              onApplyOfferToAllAnimals = {(fromAnimalId) => onApplyOfferToAllAnimals(fromAnimalId)}
              version={occurrenceVersion}
            />
          ))}
        </div>

        <div className="flex gap-3 items-end mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <Label className="text-sm font-medium text-gray-700">
              Ajouter un type d'animal
            </Label>
            <Select value={selectedAnimalId} onChange={setSelectedAnimalId} options={animalsOptions}>
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