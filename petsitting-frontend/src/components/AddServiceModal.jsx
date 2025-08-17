import { useEffect, useState } from 'react';
import axios from 'axios';
import { isOccurenceAFrequence } from 'utils/helpers';

const AddServiceModal = ({ offerId, animalTypeId, osoToEdit, onClose }) => {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [occurrences, setOccurrences] = useState([]);
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE}/api/animal-type/${animalTypeId}/services`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
          const token = localStorage.getItem('token');
          const res = await axios.get(
            `${process.env.REACT_APP_API_BASE}/api/service/${serviceId}/occurences`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
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
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE}/api/service/${serviceId}/occurences`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOccurrences(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des occurrences', err);
    }
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
        <h2 className="text-xl font-bold mb-4">
          {osoToEdit ? 'Modifier le service' : 'Ajouter un service'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service</label>
            <select
              value={selectedServiceId}
              onChange={handleServiceChange}
              className="w-full border rounded px-3 py-2"
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
              <label className="block text-sm font-medium mb-1">Fréquence</label>
              <select
                value={selectedOccurrenceId}
                onChange={(e) => setSelectedOccurrenceId(e.target.value)}
                className="w-full border rounded px-3 py-2"
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
            <label className="block text-sm font-medium mb-1">Prix (€ {(isOccurenceAFrequence(occurrences.find((o) => o.id === parseInt(selectedOccurrenceId))?.label) && selectedOccurrenceId !== '') ? 'par jour': ''})</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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