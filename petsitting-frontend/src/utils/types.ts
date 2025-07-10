// Constants and default structures for PetGuardian Pro

// Default event structure
export const createEvent = (data = {}) => ({
  id: null,
  title: '',
  start: new Date(),
  end: new Date(),
  allDay: true,
  ...data
});

// Default availability structure
export const createAvailability = (data = {}) => ({
  id: null,
  start_date: '',
  end_date: '',
  general_information: '',
  ...data
});

// Default animal type structure
export const createAnimalType = (data = {}) => ({
  id: null,
  name: '',
  services: [],
  allServices: [],
  isOpen: false,
  careModes: {
    home: false,
    sitter: false
  },
  number_animals: 0,
  offer_price: 0,
  travel_price: 0,
  ...data
});

// Default service structure
export const createService = (data = {}) => ({
  id: null,
  label: '',
  occurences: [],
  ...data
});

// Default service occurrence structure
export const createServiceOccurrence = (data = {}) => ({
  id: null,
  label: '',
  price: 0,
  checked: false,
  ...data
});

// Default form data structure
export const createFormData = (data = {}) => ({
  id: null,
  start_date: '',
  end_date: '',
  general_information: '',
  ...data
});

// Default offer payload structure
export const createOfferPayload = (data = {}) => ({
  animalTypeId: null,
  availabilityId: null,
  careModes: {
    home: false,
    sitter: false
  },
  number_animals: 0,
  offer_price: 0,
  travel_price: 0,
  services: [],
  ...data
});
