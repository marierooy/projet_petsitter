import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

export function AvailabilityTypeModal({ isOpen, onClose, onSubmit, initialData })
{
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#cccccc');

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label || '');
      setColor(initialData.color || '#cccccc');
    } else {
      setLabel('');
      setColor('#cccccc');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim()) return;

    onSubmit({
      label: label.trim(),
      color,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Type de disponibilité"
      ariaHideApp={false}
      className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow"
      overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50"
    >
      <h2 className="text-lg font-semibold mb-4">
        {initialData ? 'Modifier le type' : 'Ajouter un type'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom du type</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Couleur</label>
          <input
            type="color"
            className="w-12 h-8 p-0 border rounded"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:underline text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            {initialData ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
