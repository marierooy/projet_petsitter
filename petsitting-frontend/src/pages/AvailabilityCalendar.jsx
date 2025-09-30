import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment/locale/fr';
import { Button } from 'components/ui/button';
import { AvailabilityModal } from 'components/AvailabilityModal';
import { ManagementModal } from 'components/ManagementModal';
import { ConfigurationPanel } from 'components/ConfigurationPanel';
import { AvailabilityTypeModal } from 'components/AvailabilityTypeModal';
import { useAvailabilities, useAvailabilityTypes } from 'utils/hooks';
import { createFormData } from 'utils/types';
import { format } from 'date-fns';

// Configure moment locale
moment.locale('fr');
const localizer = momentLocalizer(moment);

export default function AvailabilityCalendar() {
  const {
    events,
    loading,
    error,
    fetchAvailabilities,
    createAvailability,
    updateAvailability,
    deleteAvailability
  } = useAvailabilities();

  const {
    types,
    loading: typesLoading,
    error: typesError,
    createType,
    updateType,
    deleteType,
    refetch: fetchTypes,
  } = useAvailabilityTypes();

  // Modal states
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [managementModalOpen, setManagementModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [configPanelVisible, setConfigPanelVisible] = useState(false);
  
  // Form and selection states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(undefined);
  const [editingType, setEditingType] = useState(null);
  
  // Calendar view states
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const configPanelRef = useRef(null);

  // Handlers for availability modal
  const handleCreateAvailability = () => {
    setIsEditing(false);
    setEditFormData(undefined);
    setAvailabilityModalOpen(true);
  };

  const handleAvailabilitySubmit = async (data) => {
    if (isEditing && editFormData?.id) {
      return await updateAvailability(editFormData.id, data);
    } else {
      return await createAvailability(data);
    }
  };

  const handleCreateType = async ({ label, color }) => {
    if (!label.trim()) return;

    try {
      await createType({ label, color: color || '#cccccc' });
    } catch (err) {
      console.error('Erreur lors de la création du type :', err);
    }
  };

  const handleEditType = async (id, { label, color }) => {
    if (!label.trim()) return;

    try {
      await updateType(id, { label, color });
      // Recharge les types si nécessaire
    } catch (err) {
      console.error('Erreur lors de la modification du type :', err);
    }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Supprimer ce type ?')) return;

    try {
      await deleteType(id);
      // Recharge les types si nécessaire
    } catch (err) {
      console.error('Erreur lors de la suppression du type :', err);
    }
  };

  // Handlers for event selection and management
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setManagementModalOpen(true);
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;
    
    setEditFormData({
      id: selectedEvent.id,
      start_date: format(selectedEvent.start, 'yyyy-MM-dd'),
      end_date: format(selectedEvent.end, 'yyyy-MM-dd'),
      availabilityTypeId: selectedEvent.type_id
    });
    setIsEditing(true);
    setManagementModalOpen(false);
    setAvailabilityModalOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    const success = await deleteAvailability(selectedEvent.id);
    if (success) {
      setManagementModalOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleConfigureEvent = () => {
    setManagementModalOpen(false);
    setConfigPanelVisible(true);
    setTimeout(() => {
      configPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Close handlers
  const handleCloseAvailabilityModal = () => {
    setAvailabilityModalOpen(false);
    setIsEditing(false);
    setEditFormData(undefined);
  };

  const handleCloseManagementModal = () => {
    setManagementModalOpen(false);
    setSelectedEvent(null);
  };

  const handleCloseConfigPanel = () => {
    setConfigPanelVisible(false);
    setSelectedEvent(null);
  };

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erreur</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans text-gray-900">
      {/* Header */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
          Types de disponibilité
        </h2>

        {typesLoading ? (
          <p className="text-gray-500 text-sm italic">Chargement des types...</p>
        ) : (
          <ul className="space-y-3 text-sm text-gray-700">
            {types?.map((type) => (
              <li
                key={type.id}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <span
                  className="inline-flex items-center justify-center min-w-[90px] px-4 py-1 rounded-md font-semibold text-black"
                  style={{ backgroundColor: type.color || '#ccc' }}
                  title={`Couleur : ${type.color}`}
                >
                  {type.label}
                </span>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingType(type);
                      setTypeModalOpen(true);
                    }}
                    className="btn-blue !text-sm !px-3 !py-1 font-medium rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                    aria-label={`Modifier le type ${type.label}`}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteType(type.id)}
                    className="btn-red !text-sm !px-3 !py-1 font-medium rounded-md shadow-sm hover:bg-red-700 transition-colors"
                    aria-label={`Supprimer le type ${type.label}`}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        onClick={() => setTypeModalOpen(true)}
        className="btn-green !text-sm !px-3 !py-1 font-medium rounded-md shadow-sm hover:bg-green-700 transition-colors"
        aria-label="Ajouter un nouveau type de disponibilité"
      >
        Ajouter un type
      </button>

      <section className="mb-6 mt-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-5 border-b border-gray-300 pb-3">
          Calendrier
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <button
            onClick={handleCreateAvailability}
            disabled={loading}
            className="btn btn-green px-4 py-2 font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors"
            aria-label="Créer une nouvelle disponibilité"
          >
            Créer une disponibilité
          </button>

          <p className="text-md text-gray-600 max-w-md">
            Pour modifier ou paramétrer une disponibilité, cliquez dessus.
          </p>
        </div>
      </section>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            onView={(view) => setCurrentView(view)}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            style={{ height: 500 }}
            onSelectEvent={(event) => {
              if (event.title !== "Petsitting") {
                handleSelectEvent(event);
              }
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.color || '#4ade80',
                borderRadius: '6px',
                color: 'black',
                border: 'none',
                fontSize: '13px',
                padding: '2px 6px',
                cursor: event.title === "Petsitting" ? "not-allowed" : "pointer"
              },
            })}
            messages={{
              today: "Aujourd'hui",
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
              showMore: (total) => `+ ${total} en plus`
            }}
            formats={{
              timeGutterFormat: () => '',
              eventTimeRangeFormat: () => '',
            }}
            className="rbc-calendar-custom"
          />
        )}
      </div>

      {/* Modals */}
      <AvailabilityModal
        isOpen={availabilityModalOpen}
        onClose={handleCloseAvailabilityModal}
        onSubmit={handleAvailabilitySubmit}
        initialData={editFormData}
        availabilityTypes={types}
        isEditing={isEditing}
      />

      <ManagementModal
        isOpen={managementModalOpen}
        onClose={handleCloseManagementModal}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onConfigure={handleConfigureEvent}
      />

      <AvailabilityTypeModal
        isOpen={typeModalOpen}
        onClose={() => {
            setTypeModalOpen(false);
            setEditingType(null);
        }}
        onSubmit={async (data) => {
          if (editingType) {
            handleEditType(editingType.id, data);
          } else {
            handleCreateType(data);
          }
          setTypeModalOpen(false);
          setEditingType(null);
          setTimeout(async () => {
            await fetchAvailabilities(); 
          }, 100);
        }}
        initialData={editingType}
      />

      {/* Configuration Panel */}
      <div ref={configPanelRef}>
        <ConfigurationPanel
          isVisible={configPanelVisible}
          selectedEvent={selectedEvent}
          onClose={handleCloseConfigPanel}
        />
      </div>

      {/* Custom styles for calendar */}
    <style jsx>{`
      /* Styles généraux pour tous les boutons (calendrier et autres) */
      button {
        background-color: var(--color-pink);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 8px 14px;
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
      button:hover, button:focus {
        background-color: var(--color-pink-dark); /* bleu plus foncé */
        outline: none;
      }
      button:disabled {
        background-color: var(--color-pink-dark);
        cursor: not-allowed;
        color: #e0e7ff;
      }

      /* Calendrier personnalisé */
      .rbc-calendar-custom {
        font-family: 'Inter', sans-serif;
      }

      /* Toolbar : conteneur */
      .rbc-calendar-custom .rbc-toolbar {
        margin-bottom: 24px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
      }

      /* Boutons dans la toolbar */
      .rbc-calendar-custom .rbc-toolbar button {
        border-radius: 8px;
        padding: 8px 14px;
        font-weight: 600;
        font-family: inherit;
        color: var(--color-pink);
        background-color: transparent;
        border: 2px solid var(--color-pink);
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      .rbc-calendar-custom .rbc-toolbar button:hover {
        background-color: var(--color-pink);
        color: white;
      }

      .rbc-calendar-custom .rbc-toolbar button.rbc-active {
        background-color: var(--color-pink);
        color: white;
        border-color: var(--color-pink);
      }

      /* Titre du mois dans la toolbar (ex: "Août 2025") */
      .rbc-calendar-custom .rbc-toolbar-label {
        font-weight: 700;
        font-size: 1.25rem;
        color: var(--color-pink-dark);; /* bleu foncé */
        text-transform: capitalize; /* première lettre majuscule */
        user-select: none;
      }

      /* Événements */
      .rbc-calendar-custom .rbc-event {
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        padding: 4px 8px;
        color: #000000cc;
        box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
      }
      .rbc-calendar-custom .rbc-event:hover {
        opacity: 0.85;
        cursor: pointer;
      }

      /* Grille jour/mois - lignes et colonnes */
      .rbc-calendar-custom .rbc-day-bg {
        border: 1px solid #e5e7eb;
      }
      .rbc-calendar-custom .rbc-header {
        background-color: #f9fafb;
        color: #374151;
        font-weight: 700;
        font-size: 0.9rem;
        border-bottom: 2px solid var(--color-pink);
        text-transform: capitalize;
      }

      /* Désactiver la time gutter (pas d’heure) */
      .rbc-calendar-custom .rbc-time-gutter {
        display: none;
      }
      @media (max-width: 768px) {
        .rbc-calendar-custom .rbc-btn-group {
          display: flex;
          flex-wrap: wrap;
        }
        .rbc-calendar-custom {
          height: 620px !important;
        }
      }
    `}</style>
    </div>
  );
}
