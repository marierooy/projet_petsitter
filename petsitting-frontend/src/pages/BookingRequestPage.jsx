import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Select, SelectTrigger, SelectContent, SelectItem
} from 'components/ui/select';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import { useAuth } from '../contexts/AuthContext';

export default function BookingRequestPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const userId = user?.id;
  const token = user?.token;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [careModes, setCareModes] = useState([]);
  const [selectedCareMode, setSelectedCareMode] = useState('');
  const [animals, setAnimals] = useState([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [newAnimal, setNewAnimal] = useState({ name: '', type: '' });
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({}); // { serviceId: occurenceId }

  // Chargement initial
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE}/api/care-mode`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }).then(res => {
        const mappedCareModes = res.data.map(careMode => {
            let label = '';
            if (careMode.label === 'home') label = 'Garde à domicile';
            else if (careMode.label === 'sitter') label = 'Garde chez le petsitter';
            else label = careMode.label; // fallback au cas où

            return { ...careMode, label };
        });
        setCareModes(mappedCareModes);
      });
    axios.get(`${process.env.REACT_APP_API_BASE}/api/service`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }).then(async (res) => {
      const servicesWithOcc = await Promise.all(res.data.map(async (service) => {
        const occ = await axios.get(`${process.env.REACT_APP_API_BASE}/api/service/${service.id}/occurences`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
        return { ...service, occurences: occ.data };
      }));
      console.log(servicesWithOcc);
      setServices(servicesWithOcc);
    });

    if (isAuthenticated && userId) {
      axios.get(`${process.env.REACT_APP_API_BASE}/api/animal`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }).then(res => setAnimals(res.data));
    }
  }, [isAuthenticated, userId]);

  const handleServiceSelection = (serviceId, occurenceId) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: occurenceId
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      startDate,
      endDate,
      careModeId: selectedCareMode,
      animal: isAuthenticated
        ? { id: selectedAnimalId }
        : newAnimal,
      services: Object.entries(selectedServices).map(([serviceId, occurenceId]) => ({
        serviceId: parseInt(serviceId),
        occurenceId: parseInt(occurenceId)
      }))
    };

    // await axios.post('/api/booking-requests', payload);
    alert('Demande envoyée !');
  };

    const servicesOccurenceOptions = services.map(service =>
    service.occurences.map(occurence => ({
        value: occurence.id.toString(),
        label: occurence.label,
    }))
    );

    const careModesOptions = careModes.map(careMode => ({
        value: careMode.id.toString(),
        label: careMode.label,
    }))

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Demande de garde</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Date de début</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>Date de fin</label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label>Mode de garde</label>
        <Select value={selectedCareMode} onChange={setSelectedCareMode} options={careModesOptions}>
          <SelectTrigger />
          <SelectContent>
            {careModes.map(mode => (
              <SelectItem key={mode.id} value={mode.id.toString()}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label>Animal</label>
        {isAuthenticated ? (
          <Select value={selectedAnimalId} onChange={setSelectedAnimalId}>
            <SelectTrigger />
            <SelectContent>
              {animals.map(animal => (
                <SelectItem key={animal.id} value={animal.id.toString()}>
                  {animal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Nom de l'animal"
              value={newAnimal.name}
              onChange={e => setNewAnimal({ ...newAnimal, name: e.target.value })}
            />
            <Input
              placeholder="Type (ex: Chien)"
              value={newAnimal.type}
              onChange={e => setNewAnimal({ ...newAnimal, type: e.target.value })}
            />
          </div>
        )}
      </div>

      <div>
        <label>Services souhaités</label>
        <div className="space-y-4">
          {services.map((service, serviceId) => (
            <div key={service.id}>
              <span className="font-medium">{service.label}</span>
              <Select
                value={selectedServices[service.id] || ''}
                onChange={(val) => handleServiceSelection(service.id, val)}
                options={servicesOccurenceOptions[serviceId]}
              >
                <SelectTrigger />
                <SelectContent>
                  {service.occurences.map(occ => (
                    <SelectItem key={occ.id} value={occ.id.toString()}>
                      {occ.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleSubmit}>Envoyer la demande</Button>
    </div>
  );
}
