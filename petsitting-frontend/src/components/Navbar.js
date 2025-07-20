import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: '1rem', backgroundColor: '#f5f5f5' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Accueil</Link>

      {user?.roles?.includes('admin') ? (
        <>
          <Link to="/services-animaux" style={{ marginRight: '1rem' }}>Attribuer des services aux types d'animaux</Link>
          <Link to="/occurences-services" style={{ marginRight: '1rem' }}>Attribuer des occurences aux services</Link>
        </>): ''
      }
      {user?.roles?.includes('petsitter') ? (
        <>
          <Link to="/disponibilites" style={{ marginRight: '1rem' }}>Calendrier des disponibilités</Link>
        </>): ''
      }
      {user?.roles?.includes('owner') || !user ? (
        <>
          <Link to="/chercher-petsitting" style={{ marginRight: '1rem' }}>Chercher un petsitting</Link>
        </>): ''
      }
      {user?.roles?.includes('owner') ? (
        <>
          <Link to="/mes-annonces" style={{ marginRight: '1rem' }}>Mes annonces</Link>
        </>): ''
      }
      {user ? (
        <>
          <Link to="/mes-animaux" style={{ marginRight: '1rem' }}>Mes animaux</Link>
          <Link to="/mes-informations" style={{ marginRight: '1rem' }}>Mes informations</Link>
          <button onClick={logout}>Déconnexion</button>
        </>
      ) : (
        <Link to="/login">Connexion</Link>
      )}
    </nav>
  );
};

export default Navbar;
