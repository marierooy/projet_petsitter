import { X } from 'lucide-react';
import React, { useState } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem } from 'components/ui/select';
import { Button } from 'components/ui/button';

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
    <div className="mt-4 border rounded p-4 bg-gray-50">
      <h2 className="font-semibold text-lg mb-2">Services pour {animal.name}</h2>

      <ul className="space-y-2 mb-4">
        {selectedServiceIds.map(serviceId => {
          const service = allServices.find(s => s.id === serviceId);
          const selectedOccurrence = selectedServiceIndex[serviceId];

          return (
            <li key={serviceId} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{service?.label}</div>
                <div className="text-sm text-gray-600">
                  Fréquence : {selectedOccurrence ? service?.occurences?.find(o => o.id === selectedOccurrence)?.label : 'Non sélectionnée'}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedOccurrence ? selectedOccurrence.toString() : ''}
                  onChange={(val) => onSelectOccurrence(serviceId, parseInt(val, 10))}
                >
                  <SelectTrigger className="w-32" />
                  <SelectContent>
                    {service?.occurences?.map(o => (
                      <SelectItem key={o.id} value={o.id.toString()}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <button
                  onClick={() => onRemoveService(serviceId)}
                  className="text-red-500 hover:text-red-700"
                  title="Supprimer le service"
                >
                  <X />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {availableServices.length > 0 && (
        <div className="flex space-x-2 items-center">
          <Select value={serviceToAdd} onChange={setServiceToAdd} className="flex-[2]">
            <SelectTrigger />
            <SelectContent>
              {availableServices.map(service => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="flex-[1]"
            onClick={() => {
              if (serviceToAdd) {
                onAddService(parseInt(serviceToAdd, 10));
                setServiceToAdd('');
              }
            }}
          >
            + Ajouter service
          </Button>
        </div>
      )}
    </div>
  );
}