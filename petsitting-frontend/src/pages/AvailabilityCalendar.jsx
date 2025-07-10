import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
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
    createAvailability,
    updateAvailability,
    deleteAvailability
  } = useAvailabilities();

  const {
    types,
    loading: typesLoading,
    createType,
    updateType,
    deleteType,
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
      general_information: selectedEvent.title
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
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Types de disponibilité</h3>

        {typesLoading ? (
          <p className="text-gray-500 text-sm">Chargement des types...</p>
        ) : (
          <ul className="space-y-1 text-sm text-gray-700">
            {types?.map((type) => (
              <li key={type.id} className="p-2 rounded flex items-center gap-2 justify-between bg-gray-50">
                <span
                  className="inline-block px-3 py-1 h-6 rounded font-medium flex items-center justify-center min-w-[80px] text-center"
                  style={{ backgroundColor: type.color || '#ccc'}}
                  title={`Couleur : ${type.color}`}
                >
                  {type.label}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingType(type);
                      setTypeModalOpen(true);
                    }}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteType(type.id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => setTypeModalOpen(true)}
        className="text-sm text-green-600 hover:underline"
      >
        + Ajouter un type
      </button>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Disponibilités</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Button
            onClick={handleCreateAvailability}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
          >
            Créer une disponibilité
          </Button>
          
          <p className="text-sm text-gray-600">
            Pour modifier ou paramétrer une disponibilité, cliquez dessus.
          </p>
        </div>
      </div>

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
            onSelectEvent={handleSelectEvent}
            eventPropGetter={() => ({
              style: {
                backgroundColor: '#4ade80',
                borderRadius: '6px',
                color: 'black',
                border: 'none',
                fontSize: '13px',
                padding: '2px 6px'
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
        onSubmit={(data) => {
          if (editingType) {
            handleEditType(editingType.id, data);
          } else {
            handleCreateType(data);
          }
          setTypeModalOpen(false);
          setEditingType(null);
        }}
        initialData={editingType}
      />

      {/* Configuration Panel */}
      <ConfigurationPanel
        isVisible={configPanelVisible}
        selectedEvent={selectedEvent}
        onClose={handleCloseConfigPanel}
      />

      {/* Custom styles for calendar */}
      <style jsx>{`
        .rbc-calendar-custom .rbc-event {
          border-radius: 6px;
          font-weight: 500;
        }
        .rbc-calendar-custom .rbc-event:hover {
          opacity: 0.9;
          cursor: pointer;
        }
        .rbc-calendar-custom .rbc-toolbar {
          margin-bottom: 20px;
        }
        .rbc-calendar-custom .rbc-toolbar button {
          border-radius: 6px;
          padding: 8px 12px;
          font-weight: 500;
        }
        .rbc-calendar-custom .rbc-toolbar button:hover {
          background-color: #f3f4f6;
        }
        .rbc-calendar-custom .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
          color: white;
        }
      `}</style>
    </div>
  );
}
