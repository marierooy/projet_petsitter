import React from 'react';
import { Button } from 'components/ui/button';
import { Label } from 'components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui/select';

export function AnimalAccordion({
  animal,
  onToggle,
  onRemove,
  onRemoveService,
  onAddService,
  onSelectService,
  selectedServiceIndex,
  selectedOccurrences = {},
  onSelectOccurrence
}) {
  const id = animal.id;

  const availableServices =
    animal.allServices?.filter(
      (s) => !animal.services?.some((existing) => existing.id === s.id)
    ) || [];

  const servicesOptions = availableServices.map(service => ({
    value: service.id.toString(),
    label: service.label,
  }));

  return (
    <div className="border rounded-lg mb-4 overflow-visible">
      {/* Accordion Header */}
      <div
        className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 flex justify-between items-center cursor-pointer transition-colors"
        onClick={() => onToggle(id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(id);
          }
        }}
      >
        <span className="font-medium text-gray-900">{animal.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{animal.isOpen ? '−' : '+'}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            className="appearance-none bg-transparent border-none p-0 m-0 text-red-500 hover:bg-transparent hover:text-red-500 focus:outline-none focus:ring-0 active:bg-transparent"
            title="Supprimer cet animal"
          >
            ❌
          </Button>
        </div>
      </div>

      {/* Accordion Content */}
      {animal.isOpen && (
        <div className="p-4 bg-white border-t">
          {/* Services Section */}
          <div className="border-t pt-2">
            <h4 className="font-semibold text-gray-900 mb-3">Services :</h4>

            {animal.services?.map((service) => (
              <div key={service.id} className="p-3 bg-gray-50 rounded-lg mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{service.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveService(id, service.id)}
                    className="appearance-none bg-transparent border-none p-0 m-0 text-red-500 hover:bg-transparent hover:text-red-500 focus:outline-none focus:ring-0 active:bg-transparent"
                  >
                    ❌
                  </Button>
                </div>

                {/* Occurrence Select */}
                <div className="ml-2 max-w-xs">
                  <Label className="text-sm">Fréquence du service</Label>
                  <Select
                    value={
                      selectedOccurrences?.[animal.id]?.[service.id]?.toString() || ''
                    }
                    onValueChange={(val) =>
                      onSelectOccurrence(id, service.id, parseInt(val))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      {service.occurences?.map((occ) => (
                        <SelectItem key={occ.id} value={occ.id.toString()}>
                          {occ.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            {/* Add New Service */}
            {availableServices.length > 0 && (
              <div className="flex gap-2 items-end mt-2">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Ajouter un service</Label>
                  <Select
                    value={selectedServiceIndex[id] || ''}
                    onValueChange={(val) => onSelectService(id, val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicesOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => onAddService(id)}
                  disabled={!selectedServiceIndex?.[id]}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  + Ajouter
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
