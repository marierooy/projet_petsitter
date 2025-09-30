import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchCsrfToken } from '../utils/csrf';

function AddEditAnimalForm({ initialData, onSuccess, onClose }) {
  const [animalTypes, setAnimalTypes] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthDate: '',
    description: '',
    animalTypeId: ''
  });

  // Charger le CSRF token
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await fetchCsrfToken();
        setCsrfToken(token);
      } catch (err) {
        console.error('Erreur chargement CSRF:', err);
      }
    };
    getToken();
  }, []);

  // Charger les types d'animaux une fois le CSRF chargé
  useEffect(() => {
    if (!csrfToken) return;
    axios.get(`${process.env.REACT_APP_API_BASE}/api/animal-type`, {
      withCredentials: true,
      headers: { "X-CSRF-Token": csrfToken }
    })
    .then(res => setAnimalTypes(res.data))
    .catch(err => console.error('Erreur chargement types :', err));
  }, [csrfToken]);

  // Initialiser le formulaire si édition
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        gender: initialData.gender || '',
        birthDate: initialData.birthDate || '',
        description: initialData.description || '',
        animalTypeId: initialData.animalTypeId || ''
      });
    }
  }, [initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!csrfToken) {
      alert('CSRF token non chargé, réessayez.');
      return;
    }
    try {
      if (initialData) {
        await axios.put(`${process.env.REACT_APP_API_BASE}/api/animal/${initialData.id}/edit`, formData, {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken }
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE}/api/animal/add`, formData, {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken }
        });
      }
      onSuccess();
    } catch (err) {
      console.error('Erreur soumission :', err);
      alert('Une erreur est survenue.');
    }
  };

  return (
    <div className='modal'>
      <header>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 border-b-4 border-green-500 pb-2 inline-block">
          {initialData ? "Modifier" : "Ajouter"} un animal
        </h2>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          {/* Nom */}
          <div className="col-span-2 md:col-span-1">
            <label className="labelForm">Nom</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="inputForm"
            />
          </div>

          {/* Genre */}
          <div className="col-span-2 md:col-span-1">
            <label className="labelForm">Genre</label>
            <div className="flex items-center gap-8">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="m"
                  checked={formData.gender === "m"}
                  onChange={handleChange}
                  className="mr-2 accent-green-600"
                />
                Mâle
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="f"
                  checked={formData.gender === "f"}
                  onChange={handleChange}
                  className="mr-2 accent-green-600"
                />
                Femelle
              </label>
            </div>
          </div>

          {/* Date de naissance */}
          <div>
            <label htmlFor="birthDate" className="labelForm">Date de naissance</label>
            <input
              id="birthDate"
              type="date"
              name="birthDate"
              required
              value={formData.birthDate}
              onChange={handleChange}
              className="inputForm"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="animalTypeId" className="labelForm">Type</label>
            <select
              id="animalTypeId"
              name="animalTypeId"
              required
              value={formData.animalTypeId}
              onChange={handleChange}
              className="inputForm"
            >
              <option value="">-- Choisir un type --</option>
              {animalTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* Description (sur toute la largeur) */}
          <div className="col-span-2">
            <label htmlFor="description" className="labelForm">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="inputForm"
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
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
            {initialData ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEditAnimalForm;