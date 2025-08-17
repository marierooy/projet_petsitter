import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar-container">
      <ul className="navbar-list">
        <li><Link to="/" className="nav-link">Accueil</Link></li>

        {user?.roles?.includes('admin') && (
          <>
            <li><Link to="/services-animaux" className="nav-link">Attribuer des services aux types d'animaux</Link></li>
            <li><Link to="/occurences-services" className="nav-link">Attribuer des occurences aux services</Link></li>
          </>
        )}

        {user?.roles?.includes('petsitter') && (
          <li><Link to="/disponibilites" className="nav-link">Calendrier</Link></li>
        )}

        {(user?.roles?.includes('owner') || !user) && (
          <li><Link to="/chercher-petsitting" className="nav-link">Chercher un petsitting</Link></li>
        )}

        {/* {user?.roles?.includes('owner') && (
          <li><Link to="/mes-annonces" className="nav-link">Mes annonces</Link></li>
        )} */}

        {user ? (
          <>
            <li><Link to="/mes-animaux" className="nav-link">Mes animaux</Link></li>
            <li><Link to="/mes-informations" className="nav-link">Mes informations</Link></li>
            <li><Link to="/mes-contrats" className="nav-link">Mes contrats</Link></li>
            <li><button onClick={logout} className="btn-green btn-logout">Déconnexion</button></li>
          </>
        ) : (
          <li><Link to="/login" className="btn-blue !text-white nav-link">Connexion</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;