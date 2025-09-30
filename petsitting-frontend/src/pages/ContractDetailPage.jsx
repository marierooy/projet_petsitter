import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AddServiceModal from 'components/AddServiceModal';
import { isOccurenceAFrequence } from 'utils/helpers';
import { fetchCsrfToken } from '../utils/csrf';

const ContractDetailPage = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const navigate = useNavigate();
  const [modalState, setModalState] = useState({
    open: false,
    contractId: null,
    offerId: null,
    animalTypeId: null,
    osoToEdit: null,
  });

  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const token = await fetchCsrfToken();
        setCsrfToken(token);
      } catch (err) {
        console.error("Erreur récupération CSRF token", err);
      }
    };
    fetchCsrf();
  }, []);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      if (user) {
        setUserId(user.id);
      }

      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/contract`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      setContracts(res.data);
    } catch (err) {
      console.error('Erreur de chargement des contrats', err);
    }
  };

  const handleValidate = async (contractId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE}/api/contract/${contractId}/validate`, null, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      fetchContracts();
    } catch (err) {
      alert("Erreur lors de la validation du contrat.");
    }
  };

  const handleDelete = async (contractId) => {
    const confirmed = window.confirm(`Voulez-vous vraiment supprimer ce contrat ?`);
    if (!confirmed) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/contract/${contractId}`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      setContracts(prev => prev.filter(c => c.id !== contractId));
    } catch (err) {
      alert('Erreur lors de la suppression du contrat.');
    }
  };

  const handleDeleteServiceOccurence = async (offerId, osoId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/offer/${offerId}/service/${osoId}`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      fetchContracts();
    } catch (err) {
      alert("Erreur lors de la suppression du service.");
    }
  };

  const openModal = (contractId, offerId, animalTypeId, osoToEdit = null) => {
    setModalState({ open: true, contractId, offerId, animalTypeId, osoToEdit });
  };

  const closeModal = () => {
    setModalState({ open: false, contractId: null, offerId: null, animalTypeId: null });
    fetchContracts(); // Refresh après ajout
  };

  if (!contracts.length) return <div className="p-6">Aucun contrat trouvé.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 inline-block w-auto border-b-4 border-green-500" style={{ color: 'var(--color-green-dark)' }}>
        Mes contrats
      </h1>

      <ul className="space-y-6">
        {contracts.map((contract) => {
          const aoc = contract.AdvertOfferContracts?.[0];
          const isOwner = aoc?.owner_id === userId;
          const isPetsitter = aoc?.petsitter_id === userId;
          const canValidate = (isOwner && !contract.owner_validation) || (isPetsitter && !contract.petsitter_validation);

          return (
            <div
              key={contract.id}
              className="bg-white shadow-lg rounded-xl p-6"
            >
              {/* En-tête du contrat */}
              <div className="flex flex-wrap flex-col-reverse justify-between items-start mb-4">
                <div>
                  <h2 className="inline-block text-green-800 text-xl font-bold py-1 rounded-full mb-2">
                    Contrat #{contract.id}
                  </h2>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full">
                      <b>Validation propriétaire:</b> {contract.owner_validation ? "✅" : "❌"}
                    </span>
                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full">
                      <b>Validation petsitter:</b> {contract.petsitter_validation ? "✅" : "❌"}
                    </span>
                    <span className="px-2 py-1 bg-[--color-pink] text-white font-medium rounded-full">
                      <b>Total:</b> {contract.total_price.toFixed(2).replace('.', ',')}€
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {canValidate && (
                    <button
                      className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 transition-colors"
                      onClick={() => handleValidate(contract.id)}
                    >
                      Valider
                    </button>
                  )}
                  <button
                    className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition-colors"
                    onClick={() => handleDelete(contract.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Informations sur les annonces/offres */}
              {contract.AdvertOfferContracts.map((link, indexL) => (
                <div key={link.id} className="mt-4">
                  {indexL === 0 && (
                    <div className="mb-4 p-4 pt-5 pb-3 bg-white rounded-lg border-l-4 border-green-400">
                      <p><b>👤 Propriétaire : </b>{link.Owner.first_name} {link.Owner.last_name} <i>{contract.owner_validation ? link.Owner.email : ""}.</i></p>
                      <p><b>👤 Petsitter : </b>{link.Petsitter.first_name} {link.Petsitter.last_name} <i>{contract.petsitter_validation ? link.Petsitter.email : ""}.</i>               
                      {isOwner && contract.petsitter_validation && contract.owner_validation ?
                      <> <b>Contrat terminé ? : </b>
                      <button
                        className="text-sm bg-[var(--color-blue)] hover:bg-[var(--color-blue-dark)] text-white px-3 py-1 rounded transition-colors"
                        onClick={() => navigate(`/petsitter-profil/${link.Petsitter.id}#avis`)}
                      >
                        Laisser un commentaire
                      </button></> : ""}</p> 
                      <p><b>📅 Date de début : </b>{new Date(link.Advert.startDate).toLocaleDateString('fr-FR')}</p>
                      <p><b>📅 Date de fin : </b>{new Date(link.Advert.endDate).toLocaleDateString('fr-FR')}</p>
                      <p><b>🏠 Mode de garde : </b>
                        {link.Advert.careMode.label === "home"
                          ? "Garde à domicile"
                          : link.Advert.careMode.label === "sitter"
                          ? "Garde chez le petsitter"
                          : link.Advert.careMode.label}
                      </p>
                    </div>
                  )}

                  <div className="mt-2 p-4 bg-white rounded-lg shadow-inner border border-green-100">
                    <h3 className="text-lg font-bold text-green-700 mb-2">🐾 Prestation pour {link.Advert.animal.name}</h3>
                    <p><b>Prix prestation :</b> {link.Offer.offer_price.toFixed(2).replace('.', ',')}€ / jour</p>
                    {link.Advert.careMode.label === "home" && (
                      <p><b>Prix déplacement :</b> {link.Offer.travel_price.toFixed(2).replace('.', ',')}€ / jour</p>
                    )}

                    <div className="mt-3 pl-3 border-l-2 border-green-200 space-y-2">
                      {link.Offer.offerServiceOccurences.map((oso) => (
                        <div key={oso.id} className="flex justify-between items-center bg-green-50 px-3 py-1 rounded">
                          <span className="text-sm">
                            <b>Service :</b> {oso.service.label} - <b>Fréquence :</b> {oso.occurence.label} - <b>Prix additif :</b> {oso.price.toFixed(2).replace('.', ',')}€ {isOccurenceAFrequence(oso.occurence.label) ? 'par jour': ''}
                          </span>
                          {isPetsitter && (
                            <div className="flex gap-2 text-sm">
                              <button
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() =>
                                  openModal(contract.id, link.Offer.id, link.Advert.animal.animalTypeId, oso)
                                }
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteServiceOccurence(link.Offer.id, oso.id)}
                                title="Supprimer"
                              >
                                ❌
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>



                    {isPetsitter && (
                      <button
                        className="mt-3 text-sm bg-[--color-blue] text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                        onClick={() =>
                          openModal(contract.id, link.Offer.id, link.Advert.animal.animalTypeId)
                        }
                      >
                        + Ajouter un service
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </ul>

      {modalState.open && (
        <AddServiceModal
          offerId={modalState.offerId}
          animalTypeId={modalState.animalTypeId}
          osoToEdit={modalState.osoToEdit}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ContractDetailPage;