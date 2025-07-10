import React, { useEffect, useState, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parseISO } from 'date-fns';
import moment from 'moment';
import axios from 'axios';
import Modal from 'react-modal';
import 'moment/locale/fr';

const localizer = momentLocalizer(moment);
Modal.setAppElement('#root'); // à placer après import si tu utilises Create React App

function AvailabilityCalendar() {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [animalTypes, setAnimalTypes] = useState([]);
  const [allAnimalTypes, setAllAnimalTypes] = useState([]); // chargés au départ
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    general_information: ''
  });
  const configPanelRef = useRef(null);

  const handleParametrerClick = () => {
    setShowConfigPanel(true);
    closeModalWithoutReset();

    // Petite attente pour que le panel soit rendu, puis scroll
    setTimeout(() => {
      configPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  moment.locale('fr');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAvailabilities();
    fetchAllAnimalTypes();
  }, []);

  const toggleAccordion = (index) => {
    setAnimalTypes(prev =>
      prev.map((animal, i) =>
        i === index ? { ...animal, isOpen: !animal.isOpen } : animal
      ));
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
        allServices: selectedAnimal.allServices
      }
    ]);

    setSelectedAnimalId('');
  };

  const removeAnimalType = (indexToRemove) => {
    setAnimalTypes(prev =>
      prev?.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSaveAllOffers = async () => {
    const payload = animalTypes.map(animal => ({
      animalTypeId: animal.id,
      availabilityId: selectedEvent?.id,
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
      await axios.put(
        `${process.env.REACT_APP_API_BASE}/api/offer/bulk`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Toutes les offres ont été enregistrées.");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des offres :", error);
    }
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
        [field]: value, // seul le champ modifié change
        // services et autres restent inchangés
      };
      return updated;
    });
  };

  const [selectedOccurrences, setSelectedOccurrences] = useState({});

  useEffect(() => {
    const initialSelected = {};

    animalTypes.forEach(animal => {
      initialSelected[animal.id] = {};

      animal.services.forEach(service => {
        initialSelected[animal.id][service.id] = service.occurences.map(occ => {
          // Conserver le checked et le price précédents si existants
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

  const toggleOccurrenceChecked = (animalId, serviceId, occId) => {
    setSelectedOccurrences(prev => {
      const animal = { ... (prev[animalId] || {}) };
      const serviceOccurrences = [...(animal[serviceId] || [])];

      const occIndex = serviceOccurrences.findIndex(o => o.id === occId);
      if (occIndex !== -1) {
        serviceOccurrences[occIndex] = {
          ...serviceOccurrences[occIndex],
          checked: !serviceOccurrences[occIndex].checked,
        };
      } else {
        // Si l'occurrence n'existe pas encore, l'ajouter avec checked = true
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

  const [selectedServiceIndex, setSelectedServiceIndex] = useState({});

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
        ...updated[animalIdx], // **nouvel objet animal**
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

    // Réinitialise la sélection (en dehors de setAnimalTypes pour éviter conflits)
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

  const fetchAvailabilities = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = res.data.map(av => ({
        id: av.id,
        title: av.general_information || 'Disponible',
        start: parseISO(av.start_date),
        end: parseISO(av.end_date),
        allDay: true,
      }));

      setEvents(formatted);
    } catch (error) {
      console.error('Erreur en récupérant les disponibilités :', error);
    }
  };

const fetchAnimalTypes = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/animal-type/offer`, {
      params: {
        availabilityId: selectedEvent?.id, // peut être undefined ou null
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setAnimalTypes(res.data);
  } catch (err) {
    console.error("Erreur lors du chargement des types d'animaux:", err);
  }
};

  const fetchAllAnimalTypes = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/animal-type/services/occurences`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllAnimalTypes(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des types d\'animaux:', err);
    }
  };

  const handleOpenModal = () => setModalIsOpen(true);
  const handleCloseModal = () => {
    setModalIsOpen(false);
    setShowManageModal(false);
    setFormData({ start_date: '', end_date: '', general_information: '' });
    setIsEditing(false);
    setSelectedEvent(null);
  };

  const closeModalWithoutReset = () => {
    setModalIsOpen(false);
    setShowManageModal(false);
    setIsEditing(false);
  };

  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);


  useEffect(() => {
    if (selectedEvent?.id) {
      fetchAnimalTypes();
    }
  }, [selectedEvent]);

  // Quand on clique sur un événement existant
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowManageModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/availability/${selectedEvent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAvailabilities(); // recharger la liste
      setShowManageModal(false);
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
};

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${process.env.REACT_APP_API_BASE}/api/availability/${formData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE}/api/availability/add`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchAvailabilities();
      handleCloseModal();
      setFormData({ start_date: '', end_date: '', general_information: '' });
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur lors de la soumission :', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Disponibilités</h2>

      <button
        onClick={handleOpenModal}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Créer une disponibilité
      </button>

      <p>Pour modifier ou paramétrer une disponibilité, cliquez dessus.</p>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={currentView}
        onView={view => setCurrentView(view)}
        date={currentDate}
        onNavigate={date => setCurrentDate(date)}
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={() => ({
          style: {
            backgroundColor: '#4ade80',
            borderRadius: '5px',
            color: 'black',
            border: 'none',
          },
        })}  
        messages={{
          today: 'Aujourd\'hui',
          previous: 'Précédent',
          next: 'Suivant',
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
          agenda: 'Agenda',
          date: 'Date',
          time: 'Heure',
          event: 'Événement',
          allDay: 'Toute la journée',
          noEventsInRange: 'Aucun événement prévu',
          showMore: total => `+ ${total} en plus`
        }}
        formats={{
          timeGutterFormat: () => '',
          eventTimeRangeFormat: () => '',
        }}
      />

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleCloseModal}
          contentLabel="Créer une disponibilité"
          className="bg-white p-6 max-w-md mx-auto mt-20 rounded shadow-md z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
        >
        <h3 className="text-lg font-semibold mb-4">Nouvelle disponibilité</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}
            required
            className="border p-2 rounded"
          />
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleInputChange}
            required
            className="border p-2 rounded"
          />
          <textarea
            name="general_information"
            placeholder="Informations complémentaires"
            value={formData.general_information}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-300 rounded">
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={showManageModal}
        onRequestClose={handleCloseModal}
        contentLabel="Gérer la disponibilité"
        className="bg-white p-6 max-w-lg mx-auto mt-20 rounded shadow-md z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
      >
      <h3 className="text-lg font-semibold mb-4">Gérer la disponibilité</h3>
      <p className="mb-4">{selectedEvent?.title}</p>
      <div className="flex justify-end gap-4">
        <button
          className="bg-yellow-400 text-white px-4 py-2 rounded"
          onClick={() => {
            setFormData({
              start_date: moment(selectedEvent.start).format('YYYY-MM-DD'),
              end_date: moment(selectedEvent.end).format('YYYY-MM-DD'),
              general_information: selectedEvent.title,
              id: selectedEvent.id,
            });
            setIsEditing(true);
            setModalIsOpen(true);
            setShowManageModal(false);
          }}
        >
          Modifier
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleDelete}
        >
          Supprimer
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleParametrerClick}
        >
          Paramétrer
        </button>
        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-300 rounded">
          Annuler
        </button>
      </div>
    </Modal>
    {showConfigPanel && (
      <div ref={configPanelRef} className="mt-8 border-t pt-4">
        <h3 className="text-lg font-bold mb-4">Paramétrage de la disponibilité</h3>

          {animalTypes.map((animal, index) => (
            <div key={animal.id} className="border rounded mb-2">
            <div
              className="w-full text-left px-4 py-2 bg-gray-100 flex justify-between items-center cursor-pointer"
              onClick={() => toggleAccordion(index)}
              role="button"
              tabIndex={0}
              // onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleAccordion(index); }}
            >
              <span>{animal.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Empêche le clic de déclencher toggleAccordion
                  removeAnimalType(index);
                }}
                className="text-red-500 hover:text-red-700 text-xl font-bold"
                title="Supprimer ce type d'animal"
              >
                ×
              </button>
            </div>
              {animal.isOpen && (
                <div className="p-4">
                  <label>
                    <input
                      type="checkbox"
                      checked={animal.careModes?.home || false}
                      onChange={(e) => {updateCareMode(index, 'home', e.target.checked)}}
                    />
                    Garde à domicile
                  </label>
                  <br />
                  <label>
                    <input
                      type="checkbox"
                      checked={animal.careModes?.sitter || false}
                      onChange={(e) => updateCareMode(index, 'sitter', e.target.checked)}
                    />
                    Garde chez le petsitter
                  </label>
                  <br />
                  <input
                    type="number"
                    placeholder="Nombre animaux max"
                    value={animal.number_animals || ''}
                    onChange={(e) => updateAnimalField(index, 'number_animals', e.target.value)}
                    className="border p-1 rounded mt-2"
                  />
                  <br />
                  <input
                    type="text"
                    placeholder="Prix prestation (€)"
                    value={animal.offer_price || ''}
                    onChange={(e) => updateAnimalField(index, 'offer_price', e.target.value)}
                    className="border p-1 rounded mt-2"
                  />
                  {animal.careModes?.home && (
                    <input
                      type="text"
                      placeholder="Prix déplacement (€)"
                      value={animal.travel_price || ''}
                      onChange={(e) => updateAnimalField(index, 'travel_price', e.target.value)}
                      className="border p-1 rounded mt-2"
                    />
                  )}
                  <h4 className="mt-4 font-semibold">Services :</h4>
                  {animal.services?.map((service, sIdx) => (
                    <div key={service.id} className="p-2 bg-gray-100 rounded my-1">
                      <div className="flex justify-between items-center">
                        <span>{service.label}</span>
                        <button 
                        onClick={() => removeService(index, sIdx)}
                        >❌</button>
                      </div>
                      <div className="ml-4 mt-1">
                        {service.occurences?.map((occ, oIdx) => {
                          const isChecked = selectedOccurrences[animal.id]?.[service.id]?.find(o => o.id === occ.id)?.checked || false;

                          const selectedOcc = selectedOccurrences[animal.id]?.[service.id]?.find(o => o.id === occ.id);

                          return (
                            <div key={oIdx} className="flex items-center gap-2 my-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleOccurrenceChecked(animal.id, service.id, occ.id)}
                                />
                                <span>{occ.label}</span>
                              </label>

                              {isChecked && (
                                <input
                                  type="number"
                                  value={selectedOcc.price || ''}
                                  placeholder="Prix €"
                                  onChange={(e) =>
                                    updateOccurrencePrice(animal.id, service.id, occ.id, e.target.value)
                                  }
                                  className="border p-1 rounded w-24"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="mt-2">
                    <select
                      value={selectedServiceIndex[index] || ''}
                      onChange={(e) => handleSelectService(index, e.target.value)}
                      className="border p-1 rounded mr-2"
                    >
                      <option value="">-- Choisir un service --</option>
                      {animal.allServices?.filter(s => !animal.services?.some(existing => existing.id === s.id))
                        .map((service, i) => (
                          <option key={service.id} value={service.id}>{service.label}</option>
                        ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => addSelectedService(index)}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                      disabled={!selectedServiceIndex[index]}
                    >
                      + Ajouter un service
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        <div className="mt-4">
          <select
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(e.target.value)}
            className="border p-1 rounded mr-2"
          >
            <option value="">-- Choisir un animal --</option>
            {allAnimalTypes?.filter(animal => !animalTypes.some(a => a.id === animal.id))
              .map(animal => (
                <option key={animal.id} value={animal.id}>{animal.name}</option>
              ))}
          </select>

          <button
            type="button"
            onClick={handleAddAnimal}
            className="px-2 py-1 bg-green-600 text-white rounded"
            disabled={!selectedAnimalId}
          >
            + Ajouter un animal
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSaveAllOffers}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Enregistrer
          </button>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-gray-400 text-white rounded"
          onClick={() => setShowConfigPanel(false)}
        >
          Fermer le paramétrage
        </button>
      </div>
    )}
    </div>
  );
}

export default AvailabilityCalendar;