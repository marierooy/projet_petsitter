import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ContractDetailPage = () => {
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/contract`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContracts(res.data);
      } catch (err) {
        console.error('Erreur de chargement des contrats', err);
      }
    };

    fetchContracts();
  }, []);

  if (!contracts.length) return <div className="p-6">Aucun contrat trouvé.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mes contrats</h1>
      <ul className="space-y-4">
        {contracts.map(contract => (
          <div key={contract.id} className="mb-4 p-4 border rounded">
            <h2 className="text-lg font-bold">Contrat #{contract.id}</h2>
            <p>Validé par propriétaire : {contract.owner_validation ? '✔️' : '❌'}</p>
            <p>Validé par petsitter : {contract.petsitter_validation ? '✔️' : '❌'}</p>
            <p>Prix total : {contract.total_price}€</p>
            
            {contract.AdvertOfferContracts.map(link => (
              <div key={link.id}>
                <p>Date de début : {link.Advert.startDate}</p>
                <p>Date de fin : {link.Advert.endDate}</p>
                <div className="mt-2">
                  <h3 className="font-semibold">Annonce pour {link.Advert.animal.name}</h3>
                  <p>Mode de garde : {link.Advert.careMode.label}</p>

                  <div className="mt-1 pl-2 border-l">
                    <p>Prix de la prestation : {link.Offer.offer_price} par jour</p>
                    {link.Offer.offerServiceOccurences.map((oso) => (
                      <div key={oso.id} className="text-sm">
                        Service : {oso.service.label} - Fréquence : {oso.occurence.label} - Prix additif : {oso.price}€
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </ul>
    </div>
  );
};

export default ContractDetailPage;
