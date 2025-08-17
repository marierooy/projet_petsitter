import React, { useState, useEffect } from 'react';
import { createFormData } from 'utils/types';

export function AvailabilityModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  availabilityTypes = [], 
  isEditing = false 
}) {
  const [formData, setFormData] = useState(createFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...createFormData(),
        ...initialData,
        availabilityTypeId: initialData.availabilityTypeId || ''
      });
    } else {
      setFormData(createFormData());
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);

    if (start >= end) {
      alert("La date de début doit être antérieure à la date de fin.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
        setFormData(createFormData());
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData(createFormData());
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      onClick={handleClose}
    >
      <div
        className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 border-b-4 border-green-500 pb-2 inline-block">
            {isEditing ? 'Modifier la disponibilité' : 'Nouvelle disponibilité'}
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label htmlFor="availability_type_id" className="labelForm">
              Type de disponibilité
            </label>
            <select
              id="availability_type_id"
              name="availabilityTypeId"
              value={formData.availabilityTypeId || ''}
              onChange={handleInputChange}
              required
              className="inputForm"
            >
              <option value="">-- Choisir un type --</option>
              {availabilityTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date début */}
          <div>
            <label htmlFor="start_date" className="labelForm">
              Date de début
            </label>
            <input
              id="start_date"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
              className="inputForm"
            />
          </div>

          {/* Date fin */}
          <div>
            <label htmlFor="end_date" className="labelForm">
              Date de fin
            </label>
            <input
              id="end_date"
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              required
              className="inputForm"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-red"
              aria-label="Annuler"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-green"
              aria-label="Enregistrer"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
