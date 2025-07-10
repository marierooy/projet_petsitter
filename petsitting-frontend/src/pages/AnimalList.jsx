import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddEditAnimalForm from './AddEditAnimalForm';

function AnimalList() {
  const [animals, setAnimals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/animal`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAnimals(res.data);
  };

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Confirmer la suppression de cet animal ?");
  if (!confirmDelete) return;

  try {
    await axios.delete(`${process.env.REACT_APP_API_BASE}/api/animal/${id}/delete`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAnimals(); // rafraîchir la liste
  } catch (err) {
    console.error('Erreur suppression :', err);
    alert("Une erreur est survenue lors de la suppression.");
  }
};

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Mes animaux</h2>

      <ul>
        {animals.map(animal => (
          <li key={animal.id} className="mb-2 border-b pb-2">
            {animal.name}, {animal.animalType.name.toLowerCase()}, {formatGender(animal.gender)}, {getAge(animal.birthDate)}, {animal.description}
            
            <button
              onClick={() => {
                setEditingAnimal(animal);
                setShowModal(true);
              }}
              className="ml-4 text-blue-600 hover:underline"
            >
              Modifier
            </button>

            <button
              onClick={() => handleDelete(animal.id)}
              className="ml-2 text-red-600 hover:underline"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>

      <button
        className="btn-green"
        onClick={() => {
          setEditingAnimal(null);
          setShowModal(true);
        }}
      >
        Ajouter un animal
      </button>

      {/* 👇 AJOUTE LA MODALE ICI 👇 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
            <AddEditAnimalForm
              token={token}
              initialData={editingAnimal}
              onSuccess={() => {
                setShowModal(false);
                fetchAnimals();
              }}
            />
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-red-600 hover:underline"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const formatGender = (gender) => {
  if (gender === 'm') return 'mâle';
  if (gender === 'f') return 'femelle';
  return '';
};

function getAge(birthDateString) {
  const birthDate = new Date(birthDateString);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  // Ajuste les mois si le jour du mois n'est pas encore passé
  if (days < 0) {
    months--;
  }

  // Ajuste les années si le mois n'est pas encore passé
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return `${years} an${years > 1 ? 's' : ''}`;
  } else {
    return `${months} mois`;
  }
}

export default AnimalList;