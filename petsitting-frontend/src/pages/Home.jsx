import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col md:flex-row items-center gap-8">

        {/* Image */}
        <div className="flex justify-center md:justify-start">
          <img
            src="/images/iStock-1296353202.jpg"
            alt="animaux de compagnie"
            className="h-auto"
            style={{ width: '70%', marginLeft: '-100px' }}
          />
        </div>

        {/* Texte */}
        <div className="text-center md:ml-[-350px]">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-var(--color-green-dark)">
            Bienvenue sur Petsitting App 🐾
          </h1>

          <p className="text-var(--color-text) text-lg md:text-xl mb-8 leading-relaxed">
            Ce service vous permet de trouver ou proposer des gardes d’animaux en toute confiance.
          </p>

          {user ? (
            <div className="alert-success max-w-xs p-4 rounded-lg mx-auto md:mx-0">
              <p>Bonjour, vous êtes connecté ! 🎉</p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="mb-4 text-var(--color-muted) font-medium">
                Connectez-vous pour accéder à toutes les fonctionnalités !
              </p>
              <Link
                to="/login"
                className="btn btn-blue font-bold"
              >
                🔐 Se connecter
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;
