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
  onUpdateOccurrencePrice,
  onApplyServiceToAllAnimals,
  onApplyOfferToAllAnimals,
}) {

  // const [localOccurrences, setLocalOccurrences] = useState(selectedOccurrences);

  // useEffect(() => {
  //   setselectedOccurrences(selectedOccurrences);
  // }, [version]);

  const id = animal.id;

  const availableServices =
    animal.allServices?.filter(
      (s) => !animal.services?.some((existing) => existing.id === s.id)
    ) || [];

  const servicesOptions = availableServices.map(service => ({
    value: service.id.toString(),
    label: service.label,
  }));

  const handleChange = (field, e) => {
    let original = e.target.value;        // la valeur telle qu'elle a été saisie

    // Remplace la virgule par un point pour parseFloat
    let val = original.replace(',', '.');
    let num = parseFloat(val);

    if (isNaN(num) || num < 0) {
      onUpdateField(id, field, '');
      return;
    }

    // Arrondi à 2 décimales
    num = Math.round(num * 100) / 100;

    // Convertit en string avec 2 décimales et remet le séparateur original
    const formatted = num.toString();

    onUpdateField(id, field, formatted);
  };

  const handleChangeOccurrencePrice = (animalId, serviceId, occId, e) => {
    let original = e.target.value;        // la valeur telle qu'elle a été saisie

    // Remplace la virgule par un point pour parseFloat
    let val = original.replace(',', '.');
    let num = parseFloat(val);

    if (isNaN(num) || num < 0) {
      onUpdateOccurrencePrice(animalId, serviceId, occId, '');
      return;
    }

    // Arrondi à 2 décimales
    num = Math.round(num * 100) / 100;

    // Convertit en string avec 2 décimales et remet le séparateur original
    const formatted = num.toString();

    onUpdateOccurrencePrice(animalId, serviceId, occId, formatted);
  };

  return (
    <div className="border rounded-lg mb-4 overflow-visible">
      {/* Accordion Header */}
      <div
        className="w-full text-left p-5 bg-green-50 hover:bg-green-100 focus:ring-green-400 font-semibold text-green-800 flex justify-between items-center transition"
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
        <span className="font-semibold text-green-800">{animal.name}</span>

        <div className="flex items-center gap-3">
          {/* Toggle Icon */}
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${
              animal.isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
          </svg>

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            className="supress-animal appearance-none bg-transparent hover:scale-110 border-none p-0 text-red-500 hover:text-red-600 hover:bg-transparent focus:outline-none"
            title="Supprimer ce type d'animal"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Accordion Content */}
      {animal.isOpen && (
        <div className="p-4 bg-white border-t">
          {/* Apply to all animals */}
          <div className="relative flex justify-between items-start">
            <h4 className="text-lg font-bold text-[var(--color-text)] mb-6 border-b-4 border-green-500 pb-2 inline-block">Configuration :</h4>
            <button
              className="group bg-transparent p-1 hover:scale-110 hover:bg-transparent transition-transform"
              onClick={() => onApplyOfferToAllAnimals(animal.id)}
            >
              <img
                src="https://img.icons8.com/?size=100&id=85799&format=png&color=000000"
                alt="Appliquer à tous les animaux"
                className="w-8 h-8"
              />

              {/* Tooltip */}
              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                  px-3 py-2 text-xs text-white bg-gray-800 rounded opacity-0 
                  pointer-events-none transition-opacity duration-200 
                  group-hover:opacity-100 w-32 text-center">
                Appliquer cette configuration à tous les animaux
              </span>
            </button>
          </div>

          {/* Care Modes */}
          <div className="space-y-3 mb-4">
            {['home', 'sitter'].map((mode) => (
              <div key={mode} className="flex items-center space-x-2">
                <input
                  id={`${mode}-${id}`}
                  type="checkbox"
                  checked={animal.careModes?.[mode] || false}
                  onChange={(e) => onUpdateCareMode(id, mode, e.target.checked)}
                  className="form-checkbox h-5 w-5 text-green-600 transition duration-150 ease-in-out"
                />
                <label htmlFor={`${mode}-${id}`} className="labelForm !mb-0">
                  {mode === 'home' ? 'Garde à domicile' : 'Garde chez le petsitter'}
                </label>
              </div>
            ))}
          </div>

          {/* Number and Pricing Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label htmlFor={`animals-${id}`} className="labelForm">
                Nombre d'animaux max
              </label>
              <input
                id={`animals-${id}`}
                type="number"
                placeholder="Nombre animaux max"
                value={animal.number_animals || ''}
                onChange={(e) => onUpdateField(id, 'number_animals', parseInt(e.target.value, 10) || '')}
                className="inputForm"
                step="1"
                min="1"
              />
            </div>

            <div>
              <label htmlFor={`price-${id}`} className="labelForm">
                Prix prestation (€ / jour)
              </label>
              <input
                id={`price-${id}`}
                type="number"
                step="0.01"
                placeholder="Prix prestation"
                value={animal.offer_price || ''}
                onChange={(e) => handleChange('offer_price', e)}
                className="inputForm"
                min="0"
              />
            </div>

            {animal.careModes?.home && (
              <div>
                <label htmlFor={`travel-${id}`} className="labelForm">
                  Prix déplacement (€ / dépl.)
                </label>
                <input
                  id={`travel-${id}`}
                  type="number"
                  step="0.01"
                  placeholder="Prix déplacement"
                  value={animal.travel_price || ''}
                  onChange={(e) => handleChange('travel_price', e)}
                  className="inputForm"
                  min="0"
                />
              </div>
            )}
          </div>

          {/* Services Section */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-bold text-[var(--color-text)] mb-6 border-b-4 border-green-500 pb-2 inline-block">Services :</h4>

            {animal.services?.map((service) => (
              <div key={service.id} className="p-3 bg-gray-50 rounded-lg mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="inline-block bg-green-100 text-green-800 text-md font-semibold px-3 py-1 rounded-full">{service.label}</span>
                  <div className="flex flex-wrap justify-center gap-2 items-center">
                    <button
                      onClick={() => onApplyServiceToAllAnimals(service.id, id)}
                      className="group bg-transparent p-1 hover:scale-110 hover:bg-transparent transition-transform"
                    >
                      <img
                        src="https://img.icons8.com/?size=100&id=85799&format=png&color=000000"
                        alt="Appliquer à tous les animaux"
                        className="w-8 h-8"
                      />

                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                          px-3 py-2 text-xs text-white bg-gray-800 rounded opacity-0 
                          pointer-events-none transition-opacity duration-200 
                          group-hover:opacity-100 w-32 text-center">
                        Appliquer ces choix de service à tous les animaux
                      </span>
                    </button>
                    <button
                      onClick={() => onRemoveService(id, service.id)}
                      className="appearance-none hover:scale-110 bg-transparent border-none p-0 m-0 text-red-500 hover:bg-transparent hover:text-red-600 focus:outline-none"
                    >
                      ❌
                    </button>
                  </div>
                </div>

                <div className="ml-2">
                  {service.occurences?.map((occ) => {
                    const selectedOcc = Array.isArray(selectedOccurrences?.[animal.id]?.[service.id])
                      ? selectedOccurrences[animal.id][service.id].find((o) => o.id === occ.id)
                      : undefined;
                    const isChecked = selectedOcc?.checked || false;

                    return (
                      <div key={occ.id} className="flex flex-wrap items-center gap-3 h-[100px] sm:h-[50px] overflow-y-auto">
                        <div className="flex items-center space-x-2">
                          <input
                            id={`occ-${animal.id}-${service.id}-${occ.id}`}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleOccurrence(animal.id, service.id, occ.id)}
                            className="form-checkbox h-5 w-5 text-green-600 transition duration-150 ease-in-out"
                          />
                          <label htmlFor={`occ-${animal.id}-${service.id}-${occ.id}`} className="labelForm !mb-0">
                            {occ.label}
                          </label>
                        </div>

                        {isChecked && (
                          <input
                            id={`occ-price-${animal.id}-${service.id}-${occ.id}`}
                            type="number"
                            step="0.01"
                            value={selectedOcc?.price || ''}
                            placeholder="Prix additif €"
                            onChange={(e) => onUpdateOccurrencePrice(animal.id, service.id, occ.id, e.target.value)}
                            // onChange={(e) => handleChangeOccurrencePrice(animal.id, service.id, occ.id, e)}
                            className="inputForm !w-44"
                            min="0"
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
                  <label className="text-md font-bold text-green-700 mb-2 block">Ajouter un service</label>
                  <select
                    value={selectedServiceIndex[id] || ''}
                    onChange={(e) => onSelectService(id, e.target.value)}
                    className="select-service inputForm"
                  >
                    <option value="">-- Sélectionner --</option>
                    {servicesOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => onAddService(id)}
                  disabled={!selectedServiceIndex?.[id]}
                  className={`px-4 py-2 rounded text-white ${
                    selectedServiceIndex?.[id] ? 'btn-blue' : 'btn-gray !bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  + Ajouter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}