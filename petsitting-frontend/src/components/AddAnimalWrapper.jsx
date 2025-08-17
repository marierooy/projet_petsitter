import { useNavigate } from 'react-router-dom';
import AddEditAnimalForm from './AddEditAnimalForm';

function AddAnimalWrapper() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSuccess = () => {
    // Rediriger vers la liste des animaux après ajout
    navigate('/mes-animaux');
  };

  return (
    <AddEditAnimalForm
      token={token}
      onSuccess={handleSuccess}
    />
  );
}

export default AddAnimalWrapper;
