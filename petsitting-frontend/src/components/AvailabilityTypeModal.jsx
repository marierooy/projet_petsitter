import React, { useEffect, useState } from "react";
import Modal from "react-modal";

export function AvailabilityTypeModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    label: "",
    color: "#cccccc",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        label: initialData.label || "",
        color: initialData.color || "#cccccc",
      });
    } else {
      setFormData({
        label: "",
        color: "#cccccc",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.label.trim()) return;
    onSubmit({
      label: formData.label.trim(),
      color: formData.color,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Type de disponibilité"
      ariaHideApp={false}
      className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto mt-20 outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50"
    >
      <header>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 border-b-4 border-green-500 pb-2 inline-block">
          {initialData ? "Modifier" : "Ajouter"} un type de disponibilité
        </h2>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          {/* Nom du type */}
          <div className="col-span-2">
            <label className="labelForm">
              Nom du type
            </label>
            <input
              type="text"
              name="label"
              required
              value={formData.label}
              onChange={handleChange}
              className="inputForm"
            />
          </div>

          {/* Couleur */}
          <div className="col-span-2 md:col-span-1">
            <label className="labelForm">
              Couleur
            </label>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-32 h-16 p-0 border rounded-md inputForm cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-red px-4 py-2"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn-green px-4 py-2"
          >
            {initialData ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </Modal>
  );
}