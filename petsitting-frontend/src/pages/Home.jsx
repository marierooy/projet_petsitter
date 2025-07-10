import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Bienvenue sur Petsitting App 🐾</h1>
      <p>
        Ce service vous permet de trouver ou proposer des gardes d’animaux en toute confiance.
      </p>

      {user ? (
        <div style={{ marginTop: '2rem' }}>
          <p>Bonjour, vous êtes connecté ! 🎉</p>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <p>Connectez-vous pour accéder aux fonctionnalités !</p>
          <Link to="/login" className="btn">
            🔐 Se connecter
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
