import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import AddServiceModal from 'components/AddServiceModal';
import { isOccurenceAFrequence } from 'utils/helpers';

const ContractDetailPage = () => {
  const [contracts, setContracts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalState, setModalState] = useState({
    open: false,
    contractId: null,
    offerId: null,
    animalTypeId: null,
    osoToEdit: null,
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      }

      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/contract`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContracts(res.data);
    } catch (err) {
      console.error('Erreur de chargement des contrats', err);
    }
  };

  const handleValidate = async (contractId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE}/api/contract/${contractId}/validate`, null, {
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/contract/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContracts(prev => prev.filter(c => c.id !== contractId));
    } catch (err) {
      alert('Erreur lors de la suppression du contrat.');
    }
  };

  const handleDeleteServiceOccurence = async (offerId, osoId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/offer/${offerId}/service/${osoId}`, {
        headers: { Authorization: `Bearer ${token}` },
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
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 inline-block w-auto border-b-4 border-green-500" style={{ color: 'var(--color-green-dark)' }}>Mes contrats</h1>
      <ul className="space-y-4">
        {contracts.map((contract, indexC) => {
          const aoc = contract.AdvertOfferContracts?.[0];
          const isOwner = aoc?.owner_id === userId;
          const isPetsitter = aoc?.petsitter_id === userId;
          const canValidate = (isOwner && !contract.owner_validation) || (isPetsitter && !contract.petsitter_validation);

          return (
            <div key={contract.id} className="bg-white rounded-lg shadow-md p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Contrat #{indexC + 1}</h2>
                  <p><b>Validé par propriétaire : </b> {contract.owner_validation ? '✅' : '❌'}</p>
                  <p><b>Validé par petsitter : </b> {contract.petsitter_validation ? '✅' : '❌'}</p>
                  <p><b>Prix total : </b> {contract.total_price.toFixed(2).replace('.', ',')}€</p>
                </div>
                <div className="space-y-2">
                  {canValidate && (
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-1"
                      onClick={() => handleValidate(contract.id)}
                    >
                      Valider
                    </button>
                  )}
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(contract.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {contract.AdvertOfferContracts.map((link, indexL) => (
                <div key={link.id}>
                  {indexL === 0 && (
                    <>
                      <p><b>Date de début : </b>{new Date(link.Advert.startDate).toLocaleDateString('fr-FR')}</p>
                      <p><b>Date de fin : </b>{new Date(link.Advert.endDate).toLocaleDateString('fr-FR')}</p>
                      <p>
                        <b>Mode de garde : </b>{" "}
                        {link.Advert.careMode.label === "home"
                          ? "Garde à domicile"
                          : link.Advert.careMode.label === "sitter"
                          ? "Garde chez le petsitter"
                          : link.Advert.careMode.label}
                      </p>
                    </>
                  )}
                  <div className="mt-2">
                    <h3 className="font-bold">Prestation pour {link.Advert.animal.name}</h3>
                    <p>Prix de la prestation : {link.Offer.offer_price.toFixed(2).replace('.', ',')}€ par jour</p>
                    {link.Advert.careMode.label === "home" && (
                      <p>Prix du déplacement : {link.Offer.travel_price.toFixed(2).replace('.', ',')}€ par jour</p>
                    )}
                    <div className="mt-1 pl-2 border-l">
                      {link.Offer.offerServiceOccurences.map((oso) => (
                        <div key={oso.id} className="text-sm flex items-center justify-between">
                          <span>
                            Service : {oso.service.label} - Fréquence : {oso.occurence.label} - Prix additif : {oso.price.toFixed(2).replace('.', ',')}€ {isOccurenceAFrequence(oso.occurence.label) ? 'par jour': ''}
                          </span>
                          {isPetsitter && (
                            <div>
                              <button
                                className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
                                onClick={() =>
                                  openModal(contract.id, link.Offer.id, link.Advert.animal.animalTypeId, oso)
                                }
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                className="ml-2 text-red-500 hover:text-red-700 text-xs"
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
                        className="mt-2 text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
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