import React, { useState } from 'react';
import Modal from 'react-modal';
import { Button } from './ui/button';

export function AvailabilityTypeModal({ isOpen, onClose, onSubmit }) {
  const [typeName, setTypeName] = useState('');
  const [typeColor, setTypeColor] = useState('#cccccc');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    await onSubmit({
      label: typeName.trim(),
      color: typeColor || '#cccccc',
    });

    setTypeName('');
    setTypeColor('#cccccc');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Ajouter un type"
      ariaHideApp={false}
      className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-24"
      overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50"
    >
      <h2 className="text-xl font-semibold mb-4">Ajouter un type de disponibilité</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={typeName}
          name="label"
          onChange={(e) => setTypeName(e.target.value)}
          placeholder="Nom du type"
          className="w-full p-2 border rounded"
        />

        <div className="flex items-center gap-3">
          <label htmlFor="color" className="text-sm text-gray-700">Couleur :</label>
          <input
            type="color"
            id="color"
            value={typeColor}
            onChange={(e) => setTypeColor(e.target.value)}
            className="w-10 h-10 border p-1 rounded"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose} className="bg-gray-300 text-black hover:bg-gray-400">
            Annuler
          </Button>
          <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">
            Ajouter
          </Button>
        </div>
      </form>
    </Modal>
  );
}