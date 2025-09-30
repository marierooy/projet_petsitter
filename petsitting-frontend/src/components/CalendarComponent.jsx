import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarComponent = ({ availabilities, onSelectAvailability }) => {

  // Calendar view states
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = availabilities.map(av => ({
    id: av.id,
    title: av.availabilityType?.label || 'Disponibilité',
    start: new Date(av.start_date),
    end: new Date(av.end_date),
    resource: av,
    color: av.availabilityType?.color || '#4ade80'
  }));

  return (
    <div className="bg-white rounded shadow p-4">
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
        onSelectEvent={(event) => onSelectAvailability(event.resource)}
        eventPropGetter={(event) => ({
            style: {
            backgroundColor: event.color || '#4ade80',
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
};

export default CalendarComponent;