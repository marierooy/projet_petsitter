const { User, Animal, Offer, OfferServiceOccurence, Availability, CareMode, AnimalType, Role, Occurence } = require('../models');
const { Op } = require('sequelize');
const { differenceInCalendarDays, parseISO, isBefore, isAfter, isEqual, addDays } = require('date-fns');
const fetch = require('node-fetch');
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const formatAddress = (user) => `${user.address}, ${user.postalCode} ${user.city}, ${user.country}`;

const getDrivingDistance = async (origin, destination) => {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${GOOGLE_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
    const element = data.rows[0].elements[0];
    return {
      distanceInKm: element.distance.value / 1000,
      durationInMin: element.duration.value / 60
    };
  }

  return { distanceInKm: null, durationInMin: null };
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
  if (date instanceof Date) return date;
  if (typeof date === 'string') return parseISO(date);
  return new Date(date); // fallback
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

    user.availabilities.forEach((availability, index) => {
    console.log(`Disponibilité ${index + 1} :`);
    console.log(`  ID   : ${availability.id}`);
    console.log(`  Début : ${availability.start_date}`);
    console.log(`  Fin   : ${availability.end_date}`);

    if (availability.offers && availability.offers.length > 0) {
        availability.offers.forEach((offer, offerIndex) => {
        console.log(`    Offre ${offerIndex + 1} : animalTypeId = ${offer.animalTypeId}`);
        });
    } else {
        console.log('    Aucune offre associée');
    }
    });

    for (const group of availabilityGroups) {
      const groupStart = group[0].start_date;
      const groupEnd = group[group.length - 1].end_date;

      console.log(safeParseDate(groupStart));
      console.log(safeParseDate(groupEnd));
      console.log(safeParseDate(startDate));
      console.log(safeParseDate(endDate));

      if (
        isAfter(safeParseDate(groupStart), safeParseDate(startDate)) ||
        isBefore(safeParseDate(groupEnd), safeParseDate(endDate))
      ) {
        continue;
      }

      console.log('ok');

      let isValid = true;
      let totalPrice = 0;
      let totalDays = 0;

      for (const availability of group) {
        const offer = availability.offers.find(o => {
          const offered = o.offerServiceOccurences.map(oo => `${oo.serviceId}-${oo.occurenceId}`);
          const required = services.map(s => `${s.serviceId}-${s.occurrenceId}`);
          const servicesOk = required.every(pair => offered.includes(pair));
          const careModeOk = o.careModes.some(c => c.id === parseInt(careModeId));
          const maxAllowed = o.number_animals;
          const animalCountOk = numberAnimalsPerType <= maxAllowed;
          console.log('servicesOk',servicesOk)
          console.log('careModeOk',careModeOk)
          console.log('animalCountOk',animalCountOk)
          return servicesOk && careModeOk && animalCountOk;
        });

        if (!offer) {
          isValid = false;
          console.log('isValid1',isValid);
          break;
        }
        console.log('isValid1',isValid);

        const prestation = offer.offer_price || 0;
        const travel = offer.travel_price || 0;
        let maxFrequence = 0;
        let totalServicesPrice = 0;

        for (const { serviceId, occurrenceId } of services) {
          const found = offer.offerServiceOccurences.find(
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

        const careModeIsHome = offer.careModes.some(c => c.id === parseInt(careModeId));
        const days = differenceInCalendarDays(safeParseDate(availability.end_date), safeParseDate(availability.start_date)) + 1;
        totalDays += days;
        const dailyPrice = prestation + totalServicesPrice + (careModeIsHome ? travel * maxFrequence : 0);
        totalPrice += dailyPrice * days;
      }

      console.log('isValid2',isValid);

      if (!isValid) continue;

      const distanceInfo = await getDrivingDistance(ownerAddress, formatAddress(user));

      results.push({
        ...user.toJSON(),
        totalPrice: Math.round(totalPrice * 100) / 100,
        distanceInKm: distanceInfo.distanceInKm,
        durationInMin: distanceInfo.durationInMin
      });
    }
  }

  return results;
};

module.exports = {
  findMatchingPetsitters
};
