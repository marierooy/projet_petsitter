import { useState, useEffect, useCallback } from 'react';
import { parseISO } from 'date-fns';
import { fetchCsrfToken } from './csrf';
import axios from 'axios';

// Custom hook for managing availability data
export function useAvailabilities() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailabilities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const CSRF_TOKEN = await fetchCsrfToken();
      const response = await axios.get(`${process.env.REACT_APP_API_BASE}/api/availability`, {
        withCredentials: true, // équivalent de credentials: 'include'
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': CSRF_TOKEN
        }
      });

      const data = response.data;
      const formatted = data.map(av => ({
        id: av.id,
        title: av.availabilityType?.label || 'Disponible',
        type_id: av.type?.id,
        start: parseISO(av.start_date),
        end: parseISO(av.end_date),
        allDay: true,
        color: av.availabilityType?.color || '#4ade80'
      }));

      setEvents(formatted);
    } catch (err) {
      console.error('Error fetching availabilities:', err);
      setError(err.message);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  const createAvailability = async (formData) => {
    try {
      const CSRF_TOKEN = await fetchCsrfToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/api/availability/add`,
        formData, // axios se charge de JSON.stringify
        {
          withCredentials: true, // équivalent de credentials: 'include'
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': CSRF_TOKEN
          }
        }
      );

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
      const CSRF_TOKEN = await fetchCsrfToken();
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE}/api/availability/${id}`,
        formData, // Axios s'occupe de JSON.stringify
        {
          withCredentials: true, // équivalent de credentials: 'include'
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': CSRF_TOKEN
          }
        }
      );

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
      const CSRF_TOKEN = await fetchCsrfToken();
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE}/api/availability/${id}`,
        {
          withCredentials: true, // équivalent de credentials: 'include'
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': CSRF_TOKEN
          }
        }
      );

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
  const [selectedOccurrences, setSelectedOccurrences] = useState({});

  function getErrorMessage(err) {
    return err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Erreur inconnue';
  }

  const fetchAnimalTypes = async () => {
    if (!availabilityId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const CSRF_TOKEN = await fetchCsrfToken();

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE}/api/animal-type/offer`,
        {
          params: { availabilityId }, // équivalent de searchParams
          withCredentials: true,      // équivalent de credentials: 'include'
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': CSRF_TOKEN
          }
        }
      );

      const data = response.data;
      setAnimalTypes(data);

      const initialSelected = {};

      data.forEach(animal => {
        const animalId = animal.id;
        initialSelected[animalId] = {};

        animal.services?.forEach(service => {
          const serviceId = service.id;
          initialSelected[animalId][serviceId] = service.occurences?.map(occ => {
            // const occId = occ.id;
            // const prevOcc = selectedOccurrences?.[animalId]?.[serviceId]?.find(o => o.id === occId) || {};

            // return {
            //   ...occ,
            //   checked: prevOcc.checked || occ.checked || false,
            //   price: prevOcc.price ?? occ.price ?? '',
            // };
            return {
              ...occ,
              checked: occ.checked || false,
              price: occ.price ?? '',
            };
          }) || [];
        });
      });

      setSelectedOccurrences(initialSelected);
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
      const CSRF_TOKEN = await fetchCsrfToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE}/api/animal-type/services/occurences`,
        {
          withCredentials: true, // équivalent de credentials: 'include'
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': CSRF_TOKEN
          }
        }
      );

      const data = response.data;
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
      const CSRF_TOKEN = await fetchCsrfToken();
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE}/api/offer/bulk`,
        payload, // axios stringify automatiquement l'objet JSON
        {
          withCredentials: true, // équivalent de credentials: 'include'
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': CSRF_TOKEN
          }
        }
      );

      console.log("All offers have been saved.");
    } catch (err) {
      console.error('Error saving offers:', err);
      setError(getErrorMessage(err));
      throw err;
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
    selectedOccurrences,
    setSelectedOccurrences,
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
      const animalId = animal.id;
      initialSelected[animalId] = {};

      animal.services?.forEach(service => {
        const serviceId = service.id;
        initialSelected[animalId][serviceId] = service.occurences?.map(occ => {
          // const occId = occ.id;
          // const prevOcc = selectedOccurrences?.[animalId]?.[serviceId]?.find(o => o.id === occId) || {};

          // return {
          //   ...occ,
          //   checked: prevOcc.checked || occ.checked || false,
          //   price: prevOcc.price ?? occ.price ?? '',
          // };
          return {
            ...occ,
            checked: occ.checked || false,
            price: occ.price ?? '',
          };
        }) || [];
      });
    });

    setSelectedOccurrences(initialSelected);
  }, [animalTypes]);

  const toggleOccurrenceChecked = (animalId, serviceId, occId) => {
    setSelectedOccurrences(prev => {
      const serviceOccurrences = prev?.[animalId]?.[serviceId] || [];

      const updatedOccurrences = serviceOccurrences.map(o =>
        o.id === occId ? { ...o, checked: !o.checked } : o
      );

      return {
        ...prev,
        [animalId]: {
          ...prev[animalId],
          [serviceId]: updatedOccurrences,
        },
      };
    });
  };

  const updateOccurrencePrice = (animalId, serviceId, occId, newPrice) => {
    setSelectedOccurrences(prev => {
      const serviceOccurrences = prev?.[animalId]?.[serviceId] || [];

      const updatedOccurrences = serviceOccurrences.map(o =>
        o.id === occId ? { ...o, price: newPrice } : o
      );

      return {
        ...prev,
        [animalId]: {
          ...prev[animalId],
          [serviceId]: updatedOccurrences,
        },
      };
    });
  };

  return {
    selectedOccurrences,
    setSelectedOccurrences,
    toggleOccurrenceChecked,
    updateOccurrencePrice,
  };
}

// Custom hook for managing animal type operations
export function useAnimalTypeOperations(animalTypes, setAnimalTypes, allAnimalTypes) {
  const [selectedServiceIndex, setSelectedServiceIndex] = useState({});

  const toggleAccordion = (animalId) => {
    setAnimalTypes(prev =>
      prev.map((animal) =>
        animal.id === animalId ? { ...animal, isOpen: !animal.isOpen } : animal
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

  const removeAnimalType = (animalIdToRemove) => {
    setAnimalTypes(prev =>
      prev?.filter((animal) => animal.id !== animalIdToRemove)
    );
  };

  const updateCareMode = (animalId, mode, value) => {
    setAnimalTypes(prev =>
      prev.map((animal) =>
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
      prev.map((animal) =>
        animal.id === animalId
          ? {
              ...animal,
              [field]: value,
            }
          : animal
      )
    );
  };

  const handleSelectService = (animalId, serviceId) => {
    setSelectedServiceIndex(prev => ({ ...prev, [animalId]: serviceId }));
  };

  const addSelectedService = (animalId) => {
    const serviceId = parseInt(selectedServiceIndex[animalId], 10);
    if (!serviceId) return;

    setAnimalTypes(prev => {
      return prev.map((animal) => {
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
      });
    });

    // Reset the selection
    setSelectedServiceIndex(prev => ({ ...prev, [animalId]: '' }));
  };

  const removeService = (animalId, serviceIdToRemove) => {
    setAnimalTypes(prev =>
      prev.map((animal) =>
        animal.id === animalId
          ? {
              ...animal,
              services: (animal.services || [])?.filter((s) => s.id !== serviceIdToRemove),
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
  const { fetchAvailabilities } = useAvailabilities();

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    try {
      const CSRF_TOKEN = await fetchCsrfToken();
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE}/api/availability-type/`,
        {
          withCredentials: true, // équivalent de credentials: 'include'
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': CSRF_TOKEN
          }
        }
      );
      const data = res.data;
      setTypes(data);
      await fetchAvailabilities();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchAvailabilities]);

  useEffect(() => {
    fetchTypes(); // Charge les types une seule fois
  }, [fetchTypes]);

  const createType = useCallback(
    async ({ label, color }) => {
      try {
        const data = { label, color };
        const CSRF_TOKEN = await fetchCsrfToken();
        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE}/api/availability-type/new`,
          data, // Axios gère automatiquement JSON.stringify
          {
            withCredentials: true, // équivalent de credentials: 'include'
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': CSRF_TOKEN
            }
          }
        );
        await fetchTypes(); // Rechargement local
      } catch (err) {
        console.error(err);
      }
    },
    [fetchTypes, token]
  );

  const updateType = useCallback(
    async (id, { label, color }) => {
      try {
        const CSRF_TOKEN = await fetchCsrfToken();
        const res = await axios.put(
          `${process.env.REACT_APP_API_BASE}/api/availability-type/${id}`,
          { label, color }, // Axios gère automatiquement JSON.stringify
          {
            withCredentials: true, // équivalent de credentials: 'include'
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': CSRF_TOKEN
            }
          }
        );
        await fetchTypes(); // Rechargement local
      } catch (err) {
        console.error(err);
      }
    },
    [fetchTypes, token]
  );

  const deleteType = useCallback(
    async (id) => {
      try {
        const CSRF_TOKEN = await fetchCsrfToken();

        const res = await axios.delete(
          `${process.env.REACT_APP_API_BASE}/api/availability-type/${id}`,
          {
            withCredentials: true, // équivalent de credentials: 'include'
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': CSRF_TOKEN
            }
          }
        );
        await fetchTypes(); // Rechargement local
      } catch (err) {
        console.error(err);
      }
    },
    [fetchTypes, token]
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
