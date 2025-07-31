const { User, Animal, Offer, OfferServiceOccurence, Availability, CareMode, AnimalType, Role, Occurence } = require('../models');
const { Op } = require('sequelize');
const { differenceInCalendarDays, parseISO, isBefore, isAfter, isEqual, addDays } = require('date-fns');
const fetch = require('node-fetch');
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const formatAddress = (user) => `${user.address}, ${user.postalCode} ${user.city}, ${user.country}`;

const getCoordinatesFromAddress = async (address) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status === 'OK' && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return { lat: location.lat, lon: location.lng };
  }

  return null;
};

const getBirdDistance = async (origin, destination) => {
  const [coord1, coord2] = await Promise.all([
    getCoordinatesFromAddress(origin),
    getCoordinatesFromAddress(destination)
  ]);

  if (!coord1 || !coord2) return { distanceInKm: null };

  const toRad = (deg) => deg * (Math.PI / 180);
  const R = 6371; // Rayon de la Terre en km

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return { distanceInKm: distance };
};

const rebuildSyntheticOffer = async (
  usedOffers,
  startDate,
  endDate,
  animalTypeId,
  totalOfferPrice = null,
  totalTravelPrice = null,
  servicesWithTotalPrice = null,
  careModeIds,
) => {
  const days = differenceInCalendarDays(safeParseDate(endDate), safeParseDate(startDate)) + 1;
  
  if (!usedOffers || usedOffers.length === 0) return null;

  const avgOfferPrice = Math.round((totalOfferPrice / days) * 100) / 100

  const avgTravelPrice = Math.round((totalTravelPrice / days) * 100) / 100

  const careModes = await CareMode.findAll({
    where: {
      id: careModeIds // tableau d’IDs : [1, 2, 3]
    }
  });

  const careModesObject = Object.fromEntries(
    careModes.map(cm => [cm.label, true])
  );

  const serviceOccurences = servicesWithTotalPrice.map(item => ({
        serviceId: item.serviceId,
        occurenceId: item.occurrenceId,
        price: Math.round(item.price / days * 100) / 100,
        checked: true
      }))

  return {
    animalTypeId,
    offer_price: avgOfferPrice,
    travel_price: avgTravelPrice,
    number_animals: Math.min(...usedOffers.map(o => o.number_animals || 1)),
    careModes: careModesObject,
    offerServiceOccurences: serviceOccurences,
    availabilityData: {
      start_date: safeParseDate(startDate),
      end_date: safeParseDate(endDate),
    }
  };
};

const getOccurenceFactor = (label) => {
  switch (label.toLowerCase()) {
    case '1 fois par jour': return 1;
    case '2 fois par jour': return 2;
    case '3 fois par jour': return 3;
    default: return 0;
  }
};

const areDatesContinuous = (a, b) => {
  if (!a?.end_date || !b?.start_date) return false;

  const endDate = typeof a.end_date === 'string' ? parseISO(a.end_date) : a.end_date;
  const startDate = typeof b.start_date === 'string' ? parseISO(b.start_date) : b.start_date;

  const nextDayAfterEnd = addDays(endDate, 1);
  return isEqual(nextDayAfterEnd, startDate);
};

const safeParseDate = (date) => {
  if (typeof date === 'string') {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)); // minuit UTC
  }
  if (date instanceof Date) return date;
  return new Date(date);
};

const groupContinuousAvailabilities = (availabilities) => {
  const sorted = [...availabilities].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const groups = [];
  let currentGroup = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    if (currentGroup.length === 0) {
      currentGroup.push(current);
    } else {
      const last = currentGroup[currentGroup.length - 1];
      if (areDatesContinuous(last, current)) {
        currentGroup.push(current);
      } else {
        groups.push(currentGroup);
        currentGroup = [current];
      }
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
};

const findMatchingPetsitters = async ({ animalId, careModeId, startDate, endDate, services, userId, numberAnimalsPerType }) => {
  const animal = await Animal.findByPk(animalId, {
    include: [{ model: AnimalType, as: 'animalType' }]
  });
  if (!animal) throw new Error('Animal non trouvé');

  const owner = await User.findByPk(userId);
  if (!owner) throw new Error('Utilisateur non trouvé');

  const ownerAddress = formatAddress(owner);

  const users = await User.findAll({
    where: { id: { [Op.not]: userId } },
    include: [
      { model: Role, where: { name: 'petsitter' }, through: { attributes: [] } },
      {
        model: Availability,
        as: 'availabilities',
        where: {
          end_date: { [Op.gte]: startDate },
          start_date: { [Op.lte]: endDate }
        },
        include: [
          {
            model: Offer,
            as: 'offers',
            // where: { animalTypeId: animal.animalTypeId },
            include: [
              {
                model: OfferServiceOccurence,
                as: 'offerServiceOccurences',
                where: { checked: true },
                required: false,
                include: [{ model: Occurence, as: 'occurence' }]
              },
              {
                model: CareMode,
                as: 'careModes'
              }
            ]
          }
        ]
      }
    ]
  });

  const results = [];

  for (const user of users) {
    const availabilityGroups = groupContinuousAvailabilities(user.availabilities);

    // user.availabilities.forEach((availability, index) => {
    // console.log(`Disponibilité ${index + 1} :`);
    // console.log(`  ID   : ${availability.id}`);
    // console.log(`  Début : ${availability.start_date}`);
    // console.log(`  Fin   : ${availability.end_date}`);

    // if (availability.offers && availability.offers.length > 0) {
    //     availability.offers.forEach((offer, offerIndex) => {
    //     console.log(`    Offre ${offerIndex + 1} : animalTypeId = ${offer.animalTypeId}`);
    //     });
    // } else {
    //     console.log('    Aucune offre associée');
    // }
    // });

    for (const group of availabilityGroups) {
      const groupStart = group[0].start_date;
      const groupEnd = group[group.length - 1].end_date;

      if (
        isAfter(safeParseDate(groupStart), safeParseDate(startDate)) ||
        isBefore(safeParseDate(groupEnd), safeParseDate(endDate))
      ) {
        continue;
      }

      let isValid = true;
      let totalPrice = 0;
      let totalOfferPrice = 0;
      let totalTravelPrice = 0;
      const servicesWithTotalPrice = [];
      let totalDays = 0;

      for (const availability of group) {
        const offer = availability.offers.find(o => {
          const offered = o.offerServiceOccurences.map(oo => `${oo.serviceId}-${oo.occurenceId}`);
          const required = services.map(s => `${s.serviceId}-${s.occurrenceId}`);
          const servicesOk = required.every(pair => offered.includes(pair));
          const careModeOk = o.careModes.some(c => c.id === parseInt(careModeId));
          const maxAllowed = o.number_animals;
          const animalCountOk = numberAnimalsPerType <= maxAllowed;
          return servicesOk && careModeOk && animalCountOk;
        });

        if (!offer) {
          isValid = false;
          break;
        }

        const prestation = offer.offer_price || 0;
        const travel = offer.travel_price || 0;
        let maxFrequence = 0;
        let totalServicesPrice = 0;
        const days = differenceInCalendarDays(safeParseDate(availability.end_date), safeParseDate(availability.start_date)) + 1;

        for (const { serviceId, occurrenceId } of services) {
          const found = offer.offerServiceOccurences.find(
            o => o.serviceId === serviceId && o.occurenceId === occurrenceId
          );
          if (found) {
            const priceToAdd = (found.price || 0) * days;

            // Cherche si ce couple serviceId/occurrenceId existe déjà
            const existing = servicesWithTotalPrice.find(
              item => item.serviceId === serviceId && item.occurrenceId === occurrenceId
            );
            if (existing) {
              existing.price += priceToAdd;
            } else {
              servicesWithTotalPrice.push({
                serviceId,
                occurrenceId,
                price: priceToAdd
              });
            }
            totalServicesPrice += found.price || 0;
            if (found.occurence?.label) {
              const freq = getOccurenceFactor(found.occurence.label);
              maxFrequence = Math.max(maxFrequence, freq);
            }
          }
        }

        const careModeIsHome = offer.careModes.some(c => c.id === parseInt(careModeId));
        totalDays += days;
        const dailyPrice = prestation + totalServicesPrice + (careModeIsHome ? travel * maxFrequence : 0);
        totalPrice += dailyPrice * days;
        console.log('daily_price', dailyPrice);
        console.log('prestation', prestation);
        console.log('totalServicesPrice', totalServicesPrice);
        console.log('travel', travel);
        totalOfferPrice = prestation * days;
        totalTravelPrice = (careModeIsHome ? travel * maxFrequence * days : 0)
      }

      if (!isValid) continue;

      const usedOffers = group.map(g => g.offers.find(o => {
        const offered = o.offerServiceOccurences.map(oo => `${oo.serviceId}-${oo.occurenceId}`);
        const required = services.map(s => `${s.serviceId}-${s.occurrenceId}`);
        const servicesOk = required.every(pair => offered.includes(pair));
        const careModeOk = o.careModes.some(c => c.id === parseInt(careModeId));
        const animalCountOk = numberAnimalsPerType <= o.number_animals;
        return servicesOk && careModeOk && animalCountOk;
      })).filter(Boolean);

      const syntheticOffer = await rebuildSyntheticOffer(usedOffers, startDate, endDate, animal.animalTypeId, totalOfferPrice, totalTravelPrice, servicesWithTotalPrice, [careModeId]);
      
      const distanceInfo = await getBirdDistance(ownerAddress, formatAddress(user));

      results.push({
        ...user.toJSON(),
        totalPrice: Math.round(totalPrice * 100) / 100,
        distanceInKm: Math.round(distanceInfo.distanceInKm * 10) / 10,
        syntheticOffer: syntheticOffer,
      });
    }
  }

  return results;
};

module.exports = {
  findMatchingPetsitters
};
