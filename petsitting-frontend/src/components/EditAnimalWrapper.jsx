import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AddEditAnimalForm from '../pages/AddEditAnimalForm';

function EditAnimalWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE}/api/animal/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setAnimal(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement animal :', err);
        alert("Impossible de charger l'animal.");
        navigate('/mes-animaux');
      });
  }, [id]);

  const handleSuccess = () => {
    navigate('/mes-animaux');
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <AddEditAnimalForm
      token={token}
      initialData={animal}
      onSuccess={handleSuccess}
    />
  );
}

export default EditAnimalWrapper;
