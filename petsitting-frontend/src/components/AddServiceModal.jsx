import { useEffect, useState } from 'react';
import axios from 'axios';
import { isOccurenceAFrequence } from 'utils/helpers';
import { fetchCsrfToken } from '../utils/csrf';

const AddServiceModal = ({ offerId, animalTypeId, osoToEdit, onClose }) => {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [occurrences, setOccurrences] = useState([]);
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const csrfToken = await fetchCsrfToken();
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE}/api/animal-type/${animalTypeId}/services`, {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken }
        });
        setServices(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des services', err);
      }
    };

    fetchServices();
  }, [animalTypeId]);

  useEffect(() => {
    const fetchEditData = async () => {
      if (osoToEdit) {
        const serviceId = osoToEdit.service.id;
        const occurenceId = osoToEdit.occurence.id;

        setSelectedServiceId(serviceId);
        setSelectedOccurrenceId(occurenceId);
        setPrice(osoToEdit.price);

        try {
          const csrfToken = await fetchCsrfToken();
          const res = await axios.get(
            `${process.env.REACT_APP_API_BASE}/api/service/${serviceId}/occurences`, {
              withCredentials: true,
              headers: { "X-CSRF-Token": csrfToken }
            });
          setOccurrences(res.data);
        } catch (err) {
          console.error('Erreur lors du chargement des occurrences pour édition', err);
        }
      }
    };

    fetchEditData();
  }, [osoToEdit]);

  const handleServiceChange = async (e) => {
    const serviceId = e.target.value;
    setSelectedServiceId(serviceId);
    setSelectedOccurrenceId('');
    setOccurrences([]);
    if (!serviceId) return;

    try {
      const csrfToken = await fetchCsrfToken();
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE}/api/service/${serviceId}/occurences`, {
              withCredentials: true,
              headers: { "X-CSRF-Token": csrfToken }
          });
      setOccurrences(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des occurrences', err);
    }
  };

    const handleChangePrice = (e) => {
    let original = e.target.value;        // la valeur telle qu'elle a été saisie

    // Remplace la virgule par un point pour parseFloat
    let val = original.replace(',', '.');
    let num = parseFloat(val);

    if (isNaN(num) || num < 0) {
      setPrice('');
      return;
    }

    // Arrondi à 2 décimales
    num = Math.round(num * 100) / 100;

    // Convertit en string avec 2 décimales et remet le séparateur original
    const formatted = num.toString();

    setPrice(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const payload = {
      serviceId: selectedServiceId,
      occurenceId: selectedOccurrenceId,
      price,
    };

    try {
      if (osoToEdit) {
        // Édition
        console.log(osoToEdit);
        await axios.put(
          `${process.env.REACT_APP_API_BASE}/api/offer/${offerId}/service/${osoToEdit.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Ajout
        await axios.post(
          `${process.env.REACT_APP_API_BASE}/api/offer/${offerId}/service`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      onClose();
    } catch (err) {
      alert('Erreur lors de la sauvegarde du service.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 border-b-4 border-green-500 pb-2 inline-block">
          {osoToEdit ? 'Modifier le service' : 'Ajouter un service'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="labelForm">Service</label>
            <select
              value={selectedServiceId}
              onChange={handleServiceChange}
              className="inputForm"
            >
              <option value="">-- Sélectionnez un service --</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {(occurrences.length > 0 || osoToEdit) && (
            <div>
              <label className="labelForm">Fréquence</label>
              <select
                value={selectedOccurrenceId}
                onChange={(e) => setSelectedOccurrenceId(e.target.value)}
                className="inputForm"
              >
                <option value="">-- Sélectionnez une fréquence --</option>
                {occurrences.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="labelForm">Prix (€ {(isOccurenceAFrequence(occurrences.find((o) => o.id === parseInt(selectedOccurrenceId))?.label) && selectedOccurrenceId !== '') ? 'par jour': ''})</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={handleChangePrice}
              className="inputForm"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-gray"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-blue"
            >
              {osoToEdit ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;