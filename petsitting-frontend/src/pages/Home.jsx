import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-green-dark)' }}>
        Bienvenue sur Petsitting App 🐾
      </h1>

      <p style={{ color: 'var(--color-text)', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.6 }}>
        Ce service vous permet de trouver ou proposer des gardes d’animaux en toute confiance.
      </p>

      {user ? (
        <div
          className="alert-success"
          style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem', borderRadius: '8px' }}
        >
          <p>Bonjour, vous êtes connecté ! 🎉</p>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--color-muted)', fontWeight: '500' }}>
            Connectez-vous pour accéder aux fonctionnalités !
          </p>
          <Link to="/login" className="btn btn-blue" style={{ fontWeight: 'bold' }}>
            🔐 Se connecter
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
