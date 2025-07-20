const { User, Animal, Offer, OfferServiceOccurence, Availability, CareMode, AnimalType, Role, Occurence } = require('../models');
const { Op } = require('sequelize');
const { differenceInCalendarDays, parseISO } = require('date-fns');
const fetch = require('node-fetch'); // ou globalThis.fetch si natif
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Convertit une adresse en format Google-friendly
const formatAddress = (user) =>
  `${user.address}, ${user.postalCode} ${user.city}, ${user.country}`;

// Récupère la distance routière entre deux adresses
const getDrivingDistance = async (origin, destination) => {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${GOOGLE_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (
    data.status === 'OK' &&
    data.rows?.[0]?.elements?.[0]?.status === 'OK'
  ) {
    const element = data.rows[0].elements[0];
    return {
      distanceInKm: element.distance.value / 1000,
      durationInMin: element.duration.value / 60
    };
  }

  return { distanceInKm: null, durationInMin: null };
};

// Fréquence des occurrences
const getOccurenceFactor = (label) => {
  switch (label.toLowerCase()) {
    case '1 fois par jour':
      return 1;
    case '2 fois par jour':
      return 2;
    case '3 fois par jour':
      return 3;
    default:
      return 0;
  }
};

const findMatchingPetsitters = async ({
  animalId,
  careModeId,
  startDate,
  endDate,
  services,
  userId,
  numberAnimalsPerType
}) => {
  const animal = await Animal.findByPk(animalId, {
    include: [{ model: AnimalType, as: 'animalType' }]
  });
  if (!animal) throw new Error('Animal non trouvé');

  const owner = await User.findByPk(userId);
  if (!owner) throw new Error('Utilisateur non trouvé');

  const ownerAddress = formatAddress(owner);

  const users = await User.findAll({
    where: {
      id: { [Op.not]: userId }
    },
    include: [
      {
        model: Role,
        where: { name: 'petsitter' },
        through: { attributes: [] }
      },
      {
        model: Availability,
        as: 'availabilities',
        where: {
          start_date: { [Op.lte]: startDate },
          end_date: { [Op.gte]: endDate }
        },
        include: [
          {
            model: Offer,
            as: 'offers',
            where: {
              animalTypeId: animal.animalTypeId
            },
            include: [
              {
                model: OfferServiceOccurence,
                as: 'offerServiceOccurences',
                where: { checked: true },
                include: [
                  { model: Occurence, as: 'occurence' }
                ]
              },
              {
                model: CareMode,
                as: 'careModes',
                where: { id: careModeId }
              }
            ]
          }
        ]
      }
    ]
  });

  const results = [];

  for (const user of users) {
    const matches = user.availabilities.some(avail =>
      avail.offers.some(offer => {
        const offered = offer.offerServiceOccurences.map(o => `${o.serviceId}-${o.occurenceId}`);
        const required = services.map(s => `${s.serviceId}-${s.occurrenceId}`);
        const matchesServices = required.every(pair => offered.includes(pair));
        const maxAllowed = offer.number_animals;
        const matchesAnimalCount = numberAnimalsPerType <= maxAllowed;

        return matchesServices && matchesAnimalCount;
      })
    );

    if (!matches) continue;

    const matchingOffer = user.availabilities
      .flatMap(avail => avail.offers)
      .find(offer => {
        const offered = offer.offerServiceOccurences.map(o => `${o.serviceId}-${o.occurenceId}`);
        const required = services.map(s => `${s.serviceId}-${s.occurrenceId}`);
        return required.every(pair => offered.includes(pair));
      });

    if (!matchingOffer) continue;

    const nbJours = differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;

    const prestation = matchingOffer.offer_price || 0;
    const travel = matchingOffer.travel_price || 0;

    let maxFrequence = 0;
    let totalServicesPrice = 0;

    for (const { serviceId, occurrenceId } of services) {
      const found = matchingOffer.offerServiceOccurences.find(
        o => o.serviceId === serviceId && o.occurenceId === occurrenceId
      );
      if (found) {
        totalServicesPrice += found.price || 0;
        if (found.occurence?.label) {
          const freq = getOccurenceFactor(found.occurence.label);
          maxFrequence = Math.max(maxFrequence, freq);
        }
      }
    }

    const careModeIsHome = matchingOffer.careModes.some(c => c.id === parseInt(careModeId));
    const dailyPrice = prestation + totalServicesPrice + (careModeIsHome ? travel * maxFrequence : 0);
    const totalPrice = dailyPrice * nbJours;

    const distanceInfo = await getDrivingDistance(ownerAddress, formatAddress(user));

    results.push({
      ...user.toJSON(),
      totalPrice: Math.round(totalPrice * 100) / 100,
      distanceInKm: distanceInfo.distanceInKm,
      durationInMin: distanceInfo.durationInMin
    });
  }

  return results;
};

module.exports = {
  findMatchingPetsitters,
};