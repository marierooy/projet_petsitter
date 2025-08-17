import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CalendarComponent from '../components/CalendarComponent';
import OfferAccordion from '../components/OfferAccordion';
import EvaluateForm from '../components/EvaluateForm';
import { useAuth } from '../contexts/AuthContext';
import { StarRating } from 'utils/helpers';
import axios from 'axios';

const displayFields = {
  presentation: "Présentation",
  habitation: "Type d’habitation",
  habitation_size: "Surface habitation (m²)",
  number_rooms: "Nombre de pièces",
  garden: "Jardin",
  garden_size: "Surface du jardin (m²)",
  terrace: "Terrasse",
  yard: "Cour",
  balcony: "Balcon",
  number_children: "Nombre d’enfants"
};

const PetsitterProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [profile, setProfile] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [averageRate, setAverageRate] = useState(null);
  const [loading, setLoading] = useState(true);

  const offerAccordionRef = useRef(null);

  const handleDeleteEvaluation = async (evalId) => {
    if (!window.confirm("Supprimer cette évaluation ?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/evaluate/${evalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvaluations(prev => prev.filter(e => e.id !== evalId));
    } catch (err) {
      console.error("Erreur suppression évaluation", err);
    }
  };

  const handleSelectAvailability = (availability) => {
    setSelectedAvailability(availability);
    setTimeout(() => {
      offerAccordionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/user/petsitter/${id}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Erreur chargement profil", err);
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/evaluate/${id}`);
        setEvaluations(res.data.evaluations);
        setAverageRate(res.data.averageRate);
      } catch (err) {
        console.error("Erreur chargement évaluations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, [id, evaluations]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/contract/petsitter/owner/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const filtered = res.data.filter(c => c.owner_validation && c.petsitter_validation && !c.evaluated);
        setContracts(filtered);
      } catch (err) {
        console.error("Erreur chargement contrats", err);
      }
    };
    fetchContracts();
  }, [id, token, evaluations]);

  if (loading || !profile) return <div>Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Photo + Nom/Note et Présentation */}
      <div className="flex flex-col md:flex-row items-start gap-12 mb-6">
        
        {/* Photo + Nom + Note */}
        <div className="flex flex-row items-center md:items-center gap-4">
          {profile.photo && (
            <img
              src={`${process.env.REACT_APP_API_BASE}${profile.photo}`}
              alt="Profil"
              className="w-44 h-44 object-cover rounded-full border-2 border-var(--color-blue)"
            />
          )}
          <div className="flex flex-col items-center md:items-start gap-2">
            <h1 className="text-2xl font-bold text-var(--color-text)">
              {profile.first_name} {profile.last_name}
            </h1>
            {averageRate ? (<StarRating rating={averageRate} />) : null}
          </div>
        </div>

        {/* Présentation */}
        {profile.presentation && (
          <div className="flex-1 ml-12 md:ml-12">
            <h3 className="text-lg font-semibold text-var(--color-text) mb-2">Présentation</h3>
            <div className="bg-white rounded-lg shadow-md p-5">
              <p>{profile.presentation}</p>
            </div>
          </div>
        )}
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* Carte Habitation */}
        <div>
          <h3 className="text-lg font-semibold text-var(--color-text) mb-2">Habitation</h3>
          <div className="bg-white rounded-lg shadow-md p-5 min-h-[13rem]">
            {profile.habitation && <p><b>Type d’habitation :</b> {profile.habitation}</p>}
            {profile.habitation_size && <p><b>Surface :</b> {profile.habitation_size} m²</p>}
            {profile.number_rooms && <p><b>Nombre de pièces :</b> {profile.number_rooms}</p>}
            
            <p>
              <b>Possède :</b>{" "}
              {profile.garden ? `jardin${profile.garden_size ? ` de ${profile.garden_size} m²` : ""}` : ""}
              {profile.terrace ? ", terrasse" : ""}
              {profile.yard ? ", cour" : ""}
              {profile.balcony ? ", balcon" : ""}
              {profile.number_children ? `, ${profile.number_children} enfant(s)` : ""}
            </p>
          </div>
        </div>

        {profile.animals && profile.animals.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-var(--color-text) mb-2">Animaux</h3>
            <div className="bg-white rounded-lg shadow-md p-5 min-h-[13rem]">
              <ul className="pl-4 space-y-2">
              {profile.animals.map((animal) => (
              <li
                key={animal.id}
                className="flex items-center gap-2"
              >
                <span className="text-blue-500">🐾</span>
                <span className="text-gray-700 text-center">
                  <b>{animal.name}</b> - {animal.animalType.name} - {formatGender(animal.gender)} - {getAge(animal.birthDate)}
                  {animal.description ? ` - ${animal.description}` : " - Aucune description"}
                </span>
              </li>
              ))}
              </ul>
            </div>
          </div>
        )}

      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2 text-var(--color-text)">Agenda</h2>
        <CalendarComponent
          availabilities={profile.availabilities}
          onSelectAvailability={handleSelectAvailability}
        />
      </div>

      <div ref={offerAccordionRef} className="mt-4">
        {selectedAvailability && <OfferAccordion selectedAvailability={selectedAvailability} />}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2 text-var(--color-text)">Commentaires et notes</h2>
        {evaluations.length === 0 ? (
          <p>Aucun commentaire pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {evaluations.map(evalItem => (
              <li key={evalItem.id} className="bg-white rounded-lg shadow-md p-5 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <strong>{evalItem.author.first_name} {evalItem.author.last_name}</strong>
                </div>
                <div>
                  {evalItem.comment}
                </div>
                <StarRating rating={evalItem.rate} />
                {user?.roles?.includes('admin') && (
                  <button
                    onClick={() => handleDeleteEvaluation(evalItem.id)}
                    className="text-var(--color-red) bg-transparent hover:bg-transparent ml-2"
                    title="Supprimer l'évaluation"
                  >
                    ❌
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {contracts.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-var(--color-text)">Laisser une évaluation</h2>
          {contracts.map(c => (
            <EvaluateForm
              key={c.id}
              contractId={c.id}
              onSuccess={() => setContracts(prev => prev.filter(pc => pc.id !== c.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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

export default PetsitterProfilePage;