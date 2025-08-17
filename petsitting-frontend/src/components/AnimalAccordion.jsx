import { X } from 'lucide-react';
import React, { useState } from 'react';

export function AnimalAccordion({
  animal,
  selectedServiceIndex,
  onRemoveService,
  onAddService,
  onSelectOccurrence,
  allServices,
}) {
  const selectedServiceIds = Object.keys(selectedServiceIndex || {}).map(Number);
  const availableServices = allServices.filter(s => !selectedServiceIds.includes(s.id));
  const [serviceToAdd, setServiceToAdd] = useState('');

  return (
    <div className="mt-4 border rounded-xl p-4 bg-gray-50">
      <h2 className="font-semibold text-lg mb-2">Services pour {animal.name}</h2>

      <ul className="space-y-2 mb-4">
        {selectedServiceIds.map(serviceId => {
          const service = allServices.find(s => s.id === serviceId);
          const selectedOccurrence = selectedServiceIndex[serviceId];

          return (
            <li key={serviceId} className="flex items-center justify-between">
              <div className="flex-[5]">
                <div className="inline-block bg-green-100 text-green-800 text-md font-semibold px-3 py-1 rounded-full">{service?.label}</div>
              </div>

              <div className="flex items-center space-x-2 flex-[5]">
                <select
                  value={selectedOccurrence ? selectedOccurrence.toString() : ''}
                  onChange={(e) =>
                    onSelectOccurrence(serviceId, parseInt(e.target.value, 10))
                  }
                  className="inputForm w-32"
                >
                  <option value="">Sélectionner</option>
                  {service?.occurences?.map(o => (
                    <option key={o.id} value={o.id.toString()}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => onRemoveService(serviceId)}
                  className="text-red-500 hover:text-red-700 hover:scale-110"
                  title="Supprimer le service"
                >
                  ❌
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {availableServices.length > 0 && (
        <div className="flex items-center space-x-2">
          <select
            value={serviceToAdd}
            onChange={(e) => setServiceToAdd(e.target.value)}
            className="inputForm flex-[7]"
          >
            <option value="">Sélectionner un service</option>
            {availableServices.map(service => (
              <option key={service.id} value={service.id.toString()}>
                {service.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!serviceToAdd}
            className={`px-4 py-2 flex-[3] rounded text-white ${
              serviceToAdd ? 'btn-blue' : 'btn-gray !bg-gray-300 cursor-not-allowed'
            }`}
            onClick={() => {
              if (serviceToAdd) {
                onAddService(parseInt(serviceToAdd, 10));
                setServiceToAdd('');
              }
            }}
          >
            + Ajouter service
          </button>
        </div>
      )}
    </div>
  );
}