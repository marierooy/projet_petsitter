import { useState, useEffect, useCallback } from 'react';
import { parseISO } from 'date-fns';

// Custom hook for managing availability data
export function useAvailabilities() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get token from localStorage (as in original code)
  const getToken = () => localStorage.getItem('token');

  const fetchAvailabilities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/availability`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const formatted = data.map(av => ({
        id: av.id,
        title: av.general_information || 'Disponible',
        start: parseISO(av.start_date),
        end: parseISO(av.end_date),
        allDay: true,
      }));

      setEvents(formatted);
    } catch (err) {
      console.error('Error fetching availabilities:', err);
      setError(err.message);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createAvailability = async (formData) => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/availability/add`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchAvailabilities();
      return true;
    } catch (err) {
      console.error('Error creating availability:', err);
      setError(err.message);
      return false;
    }
  };

  const updateAvailability = async (id, formData) => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/availability/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchAvailabilities();
      return true;
    } catch (err) {
      console.error('Error updating availability:', err);
      setError(err.message);
      return false;
    }
  };

  const deleteAvailability = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/availability/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchAvailabilities();
      return true;
    } catch (err) {
      console.error('Error deleting availability:', err);
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  return {
    events,
    isLoading,
    error,
    fetchAvailabilities,
    createAvailability,
    updateAvailability,
    deleteAvailability
  };
}

// Custom hook for managing animal types
export function useAnimalTypes(availabilityId) {
  const [animalTypes, setAnimalTypes] = useState([]);
  const [allAnimalTypes, setAllAnimalTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchAnimalTypes = async () => {
    if (!availabilityId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      const url = new URL(`${process.env.REACT_APP_API_BASE}/api/animal-type/offer`);
      url.searchParams.append('availabilityId', availabilityId);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnimalTypes(data);
    } catch (err) {
      console.error('Error fetching animal types:', err);
      setError(err.message);
      setAnimalTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllAnimalTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/animal-type/services/occurences`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAllAnimalTypes(data);
    } catch (err) {
      console.error('Error fetching all animal types:', err);
      setError(err.message);
      setAllAnimalTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAllOffers = async (payload) => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/offer/bulk`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("All offers have been saved.");
      return true;
    } catch (err) {
      console.error('Error saving offers:', err);
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchAllAnimalTypes();
  }, []);

  useEffect(() => {
    if (availabilityId) {
      fetchAnimalTypes();
    }
  }, [availabilityId]);

  return {
    animalTypes,
    setAnimalTypes,
    allAnimalTypes,
    isLoading,
    error,
    saveAllOffers,
    fetchAnimalTypes,
    fetchAllAnimalTypes
  };
}

// Custom hook for managing selected occurrences state
export function useSelectedOccurrences(animalTypes) {
  const [selectedOccurrences, setSelectedOccurrences] = useState({});

  useEffect(() => {
    const initialSelected = {};

    animalTypes.forEach(animal => {
      initialSelected[animal.id] = {};

      if (animal.services) {
        animal.services.forEach(service => {
          initialSelected[animal.id][service.id] = service.occurences ? service.occurences.map(occ => {
            // Preserve previous checked and price if they exist
            const prevOcc = selectedOccurrences?.[animal.id]?.[service.id]?.find(o => o.id === occ.id) || {};
            return {
              ...occ,
              checked: prevOcc.checked || occ.checked,
              price: prevOcc.price || occ.price,
            };
          }) : [];
        });
      }
    });

    setSelectedOccurrences(initialSelected);
  }, [animalTypes]);

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
        // If occurrence doesn't exist yet, add it with checked = true
        serviceOccurrences.push({ id: occId, checked: true });
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

  const updateOccurrencePrice = (animalIdx, serviceIdx, occId, newPrice) => {
    setSelectedOccurrences(prev => {
      const animal = prev[animalIdx] || {};
      const service = (animal[serviceIdx] || []).map(o =>
        o.id === occId ? { ...o, price: newPrice } : o
      );
      return {
        ...prev,
        [animalIdx]: {
          ...animal,
          [serviceIdx]: service,
        },
      };
    });
  };

  return {
    selectedOccurrences,
    setSelectedOccurrences,
    toggleOccurrenceChecked,
    updateOccurrencePrice
  };
}

// Custom hook for managing animal type operations
export function useAnimalTypeOperations(animalTypes, setAnimalTypes, allAnimalTypes) {
  const [selectedServiceIndex, setSelectedServiceIndex] = useState({});

  const toggleAccordion = (index) => {
    setAnimalTypes(prev =>
      prev.map((animal, i) =>
        i === index ? { ...animal, isOpen: !animal.isOpen } : animal
      )
    );
  };

  const handleAddAnimal = (selectedAnimalId) => {
    const selectedAnimal = allAnimalTypes.find(a => a.id === parseInt(selectedAnimalId, 10));
    if (!selectedAnimal) return;

    setAnimalTypes(prev => [
      ...prev,
      {
        id: selectedAnimal.id,
        name: selectedAnimal.name,
        services: selectedAnimal.services,
        allServices: selectedAnimal.allServices
      }
    ]);
  };

  const removeAnimalType = (indexToRemove) => {
    setAnimalTypes(prev =>
      prev?.filter((_, index) => index !== indexToRemove)
    );
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

    // Reset the selection
    setSelectedServiceIndex(prev => ({ ...prev, [animalIdx]: '' }));
  };

  const removeService = (index, sIdx) => {
    setAnimalTypes(prev =>
      prev.map((animal, i) =>
        i === index
          ? {
              ...animal,
              services: (animal.services || [])?.filter((_, j) => j !== sIdx),
            }
          : animal
      )
    );
  };

  return {
    selectedServiceIndex,
    setSelectedServiceIndex,
    toggleAccordion,
    handleAddAnimal,
    removeAnimalType,
    updateCareMode,
    updateAnimalField,
    handleSelectService,
    addSelectedService,
    removeService
  };
}

export function useAvailabilityTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getToken = () => localStorage.getItem('token');
  const token = getToken();

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/availability-type/`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
      if (!res.ok) throw new Error('Erreur lors du chargement des types');
      const data = await res.json();
      setTypes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  // --- CRUD functions ---

  const createType = useCallback(
    async ({ label, color }) => {
      try {
        const data = { label, color };
        const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/availability-type/new`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Erreur lors de la création');
        await fetchTypes(); // Recharge les types après ajout
      } catch (err) {
        console.error(err);
      }
    },
    [fetchTypes]
  );

  const updateType = useCallback(
    async (id, { label, color }) => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/availability-type/${id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ label, color }),
        });
        if (!res.ok) throw new Error('Erreur lors de la mise à jour');
        await fetchTypes();
      } catch (err) {
        console.error(err);
      }
    },
    [fetchTypes]
  );

  const deleteType = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/availability-type/${id}`, {
          method: 'DELETE',
          headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        });
        if (!res.ok) throw new Error('Erreur lors de la suppression');
        await fetchTypes();
      } catch (err) {
        console.error(err);
      }
    },
    [fetchTypes]
  );

  return {
    types,
    loading,
    error,
    createType,
    updateType,
    deleteType,
    refetch: fetchTypes,
  };
}