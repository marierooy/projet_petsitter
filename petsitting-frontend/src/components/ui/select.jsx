import React, { useState, cloneElement, Children } from 'react';

// Select principal : gère l'ouverture et transmet la sélection
export const Select = ({ value, onChange, children, className = '', options = [] }) => {
  const [open, setOpen] = useState(false);

  const enhancedChildren = Children.map(children, child => {
    if (child.type.displayName === 'SelectContent') {
      // Ne rendre que si open === true
      return open ? cloneElement(child, { onChange, setOpen }) : null;
    }
    if (child.type.displayName === 'SelectTrigger') {
      return cloneElement(child, {
        onClick: () => setOpen(!open),
        value,
        options,
      });
    }
    if (child.type.displayName === 'SelectValue') {
      return cloneElement(child, { value, options });
    }
    return child;
  });

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {enhancedChildren}
      {open && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// Trigger du select : bouton affichant la sélection, ouvre/ferme la liste
export const SelectTrigger = ({ children, onClick, value, options = [] }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children || (value ? <SelectValue value={value} options={options} /> : 'Sélectionner...')}
    </button>
  );
};
SelectTrigger.displayName = 'SelectTrigger';

// Affiche la valeur sélectionnée (label)
export const SelectValue = ({ value, options = [] }) => {
  const selected = options.find(opt => opt.value === value);
  return <span>{selected?.label || 'Sélectionner...'}</span>;
};
SelectValue.displayName = 'SelectValue';

// Conteneur de la liste déroulante
export const SelectContent = ({ children, onChange, setOpen, className = '' }) => {
  // On clone chaque enfant pour injecter la fonction onSelect
  const items = Children.map(children, child => {
    if (child.type.displayName === 'SelectItem') {
      return cloneElement(child, {
        onSelect: (val) => {
          onChange(val);
          setOpen(false);
        },
      });
    }
    return child;
  });

  return (
    <div
      className={`absolute z-20 mt-1 w-full border border-gray-300 rounded shadow-lg bg-white ${className}`}
      role="listbox"
    >
      {items}
    </div>
  );
};
SelectContent.displayName = 'SelectContent';

// Item individuel dans la liste déroulante
export const SelectItem = ({ children, value, onSelect }) => {
  return (
    <div
      role="option"
      tabIndex={0}
      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
      onClick={() => onSelect(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(value);
        }
      }}
    >
      {children}
    </div>
  );
};
SelectItem.displayName = 'SelectItem';