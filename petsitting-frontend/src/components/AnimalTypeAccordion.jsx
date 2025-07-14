import React from 'react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Checkbox } from 'components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui/select';

export function AnimalTypeAccordion({
  animal,
  onToggle,
  onRemove,
  onUpdateCareMode,
  onUpdateField,
  onRemoveService,
  onAddService,
  onSelectService,
  selectedServiceIndex,
  selectedOccurrences = {},
  onToggleOccurrence,
  onUpdateOccurrencePrice
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
            title="Supprimer ce type d'animal"
          >
            ❌
          </Button>
        </div>
      </div>

      {/* Accordion Content */}
      {animal.isOpen && (
        <div className="p-4 bg-white border-t">
          {/* Care Modes */}
          <div className="space-y-3 mb-4">
            {['home', 'sitter'].map((mode) => (
              <div key={mode} className="flex items-center space-x-2">
                <Checkbox
                  id={`${mode}-${id}`}
                  checked={animal.careModes?.[mode] || false}
                  onChange={(e) => onUpdateCareMode(id, mode, e.target.checked)}
                />
                <Label htmlFor={`${mode}-${id}`} className="text-sm">
                  {mode === 'home' ? 'Garde à domicile' : 'Garde chez le petsitter'}
                </Label>
              </div>
            ))}
          </div>

          {/* Number and Pricing Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <Label htmlFor={`animals-${id}`} className="text-sm font-medium">
                Nombre d'animaux max
              </Label>
              <Input
                id={`animals-${id}`}
                type="number"
                placeholder="Nombre animaux max"
                value={animal.number_animals || ''}
                onChange={(e) => onUpdateField(id, 'number_animals', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`price-${id}`} className="text-sm font-medium">
                Prix prestation (€)
              </Label>
              <Input
                id={`price-${id}`}
                type="number"
                step="0.01"
                placeholder="Prix prestation"
                value={animal.offer_price || ''}
                onChange={(e) => onUpdateField(id, 'offer_price', e.target.value)}
                className="mt-1"
              />
            </div>

            {animal.careModes?.home && (
              <div>
                <Label htmlFor={`travel-${id}`} className="text-sm font-medium">
                  Prix déplacement (€)
                </Label>
                <Input
                  id={`travel-${id}`}
                  type="number"
                  step="0.01"
                  placeholder="Prix déplacement"
                  value={animal.travel_price || ''}
                  onChange={(e) => onUpdateField(id, 'travel_price', e.target.value)}
                  className="mt-1 max-w-xs"
                />
              </div>
            )}
          </div>

          {/* Services Section */}
          <div className="border-t pt-4">
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

                <div className="ml-2">
                  {service.occurences?.map((occ) => {
                    const selectedOcc = Array.isArray(selectedOccurrences?.[animal.id]?.[service.id])? selectedOccurrences[animal.id][service.id].find(o => o.id === occ.id) : undefined;
                    const isChecked = selectedOcc?.checked || false;

                    return (
                      <div key={occ.id} className="flex items-center gap-3 h-[50px] overflow-y-auto">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`occ-${animal.id}-${service.id}-${occ.id}`}
                            checked={isChecked}
                            onChange={() => onToggleOccurrence(animal.id, service.id, occ.id)}
                          />
                          <Label htmlFor={`occ-${animal.id}-${service.id}-${occ.id}`} className="text-sm">
                            {occ.label}
                          </Label>
                        </div>

                        {isChecked && (
                          <Input
                            type="number"
                            step="0.01"
                            value={selectedOcc?.price || ''}
                            placeholder="Prix €"
                            onChange={(e) =>
                              onUpdateOccurrencePrice(animal.id, service.id, occ.id, e.target.value)
                            }
                            className="w-24"
                          />
                        )}
                      </div>
                    );
                  })}
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
                    onChange={(val) => onSelectService(id, val)}
                    options={servicesOptions}
                  >
                    <SelectTrigger />
                    <SelectContent>
                      {servicesOptions.map(option => (
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