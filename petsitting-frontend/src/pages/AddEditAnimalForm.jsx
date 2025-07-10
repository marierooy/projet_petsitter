import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AddEditAnimalForm({ token, initialData, onSuccess }) {
  const [animalTypes, setAnimalTypes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthDate: '',
    description: '',
    animalTypeId: ''
  });

  useEffect(() => {
    axios.get(process.env.REACT_APP_API_BASE + '/api/animal-type', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setAnimalTypes(res.data))
      .catch(err => console.error('Erreur chargement types :', err));
  }, []);

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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (initialData) {
        // Modifier
        await axios.put(`${process.env.REACT_APP_API_BASE}/api/animal/${initialData.id}/edit`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Ajouter
        await axios.post(`${process.env.REACT_APP_API_BASE}/api/animal/add`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess();
    } catch (err) {
      console.error('Erreur soumission :', err);
      alert('Une erreur est survenue.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold mb-2">{initialData ? 'Modifier' : 'Ajouter'} un animal</h3>
      <div>
        <label className="block mb-1">Nom</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Genre</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="m"
              checked={formData.gender === "m"}
              onChange={handleChange}
              className="mr-2"
            />
            Male
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="f"
              checked={formData.gender === "f"}
              onChange={handleChange}
              className="mr-2"
            />
            Femelle
          </label>
        </div>
      </div>
      <div>
        <label className="block mb-1">Date de naissance</label>
        <input
          type="date"
          name="birthDate"
          required
          value={formData.birthDate}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Type</label>
        <select
          name="animalTypeId"
          required
          value={formData.animalTypeId}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">-- Choisir un type --</option>
          {animalTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {initialData ? 'Modifier' : 'Ajouter'}
      </button>
    </form>
  );
}

export default AddEditAnimalForm;