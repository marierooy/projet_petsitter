import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'components/ui/dialog';
import { Button } from 'components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ManagementModal({ 
  isOpen, 
  onClose, 
  event, 
  onEdit, 
  onDelete, 
  onConfigure 
}) {
  if (!event) return null;
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full bg-white p-6 rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 border-b-4 border-green-500 pb-2 inline-block">
            Gérer la disponibilité
          </h2>
        </header>

        {/* Infos */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
          <p className="text-sm text-gray-600">
            Du {format(event.start, 'dd MMMM yyyy', { locale: fr })} <br />
            au {format(event.end, 'dd MMMM yyyy', { locale: fr })}
          </p>
        </div>

        {/* Boutons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-md font-semibold bg-yellow-400 hover:bg-yellow-500 text-white shadow-sm transition-colors"
          >
            Modifier
          </button>

          <button
            onClick={onDelete}
            className="px-4 py-2 rounded-md font-semibold bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors"
          >
            Supprimer
          </button>

          <button
            onClick={onConfigure}
            className="px-4 py-2 rounded-md font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-colors"
          >
            Paramétrer
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-semibold bg-gray-300 hover:bg-gray-400 text-gray-800 shadow-sm transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}