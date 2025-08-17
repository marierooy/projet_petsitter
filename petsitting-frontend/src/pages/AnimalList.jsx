import axios from 'axios';
import { useEffect, useState } from 'react';
import AddEditAnimalForm from '../components/AddEditAnimalForm';

function AnimalList() {
  const [animals, setAnimals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/animal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnimals(res.data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des animaux.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Confirmer la suppression de cet animal ?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/animal/${id}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnimals();
    } catch (err) {
      console.error('Erreur suppression :', err);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6 inline-block w-auto border-b-4 border-green-500" style={{ color: 'var(--color-green-dark)' }}>
        Mes animaux
      </h1>

      <ul className="space-y-6">
        {animals.map(animal => (
          <li
            key={animal.id}
            className="bg-white rounded-lg shadow-md p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between transition-transform hover:scale-[1.02]"
            style={{ color: 'var(--color-text)' }}
          >
            <div>
              <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-green-dark)' }}>
                {animal.name} 
                {/* Exemple d’emoji selon type */}
                &nbsp;
                {animal.animalType.name.toLowerCase().includes('chien') && ' 🐶'}
                {animal.animalType.name.toLowerCase() === 'chat' && ' 🐱'}
                {animal.animalType.name.toLowerCase() === 'furet' && '🦦'}
                {animal.animalType.name.toLowerCase() === 'oiseau' && '🐦'}
                {animal.animalType.name.toLowerCase() === 'reptile' && '🦎'}
                {animal.animalType.name.toLowerCase() === 'poisson' && '🐟'}
                {animal.animalType.name.toLowerCase() === 'tortue' && '🐢'}
                {animal.animalType.name.toLowerCase() === 'poule' && '🐔'}
                {/* Autres types si besoin */}
              </h3>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {animal.animalType.name.toLowerCase()} — {formatGender(animal.gender)} — {getAge(animal.birthDate)}
              </p>
              <p className="italic text-gray-600">{animal.description || <em>Aucune description</em>}</p>
            </div>

            <div className="mt-4 sm:mt-0 flex gap-3">
              <button
                onClick={() => {
                  setEditingAnimal(animal);
                  setShowModal(true);
                }}
                className="btn btn-blue px-4 py-2 font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors"
              >
                Modifier
              </button>

              <button
                onClick={() => handleDelete(animal.id)}
                className="btn btn-red px-4 py-2 font-semibold rounded-md shadow-sm hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <button
          className="btn-green"
          onClick={() => {
            setEditingAnimal(null);
            setShowModal(true);
          }}
          style={{ fontWeight: '700', padding: '0.75rem 1.5rem' }}
        >
          Ajouter un animal
        </button>
      </div>

      {/* MODALE */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <AddEditAnimalForm
              token={token}
              initialData={editingAnimal}
              onSuccess={() => {
                setShowModal(false);
                fetchAnimals();
              }}
              onClose={() => {
                setShowModal(false);
              }}
            />
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

  if (days < 0) {
    months--;
  }
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