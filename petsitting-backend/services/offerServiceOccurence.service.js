const { Offer, OfferServiceOccurence, Contract, AdvertOfferContract, ContractAdvertOfferContract, Advert, Service, Occurence } = require('../models');
const { differenceInCalendarDays } = require('date-fns');

const isOccurenceAFrequence = (label) => {
  switch (label.toLowerCase()) {
    case '1 fois': return false;
    case '2 fois': return false;
    case '3 fois': return false;
    default: return true;
  }
};

const safeParseDate = (date) => {
  if (typeof date === 'string') {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day)); // minuit UTC
  }
  if (date instanceof Date) return date;
  return new Date(date);
};

const addServiceOccurenceToOffer = async (offerId, serviceId, occurenceId, price) => {
  const offer = await Offer.findByPk(offerId, {
    include: {
      model: AdvertOfferContract,
      include: [
        {
          model: Contract,
          through: ContractAdvertOfferContract
        },
        'Advert'
      ]
    }
  });

  if (!offer) {
    throw new Error('Offre non trouvée');
  }

  // Ajout du lien service/occurence/prix
  const newLink = await OfferServiceOccurence.create({
    offerId,
    serviceId,
    occurenceId,
    price
  });

  const aoc = offer.AdvertOfferContracts?.[0];
  if (!aoc || !aoc.Contract) {
    throw new Error("Contrat lié introuvable pour cette offre");
  }

  const contract = aoc.Contract;
  const advert = aoc.Advert;
  // Rechargement complet avec tous les liens nécessaires pour recalcul

  const occurence = await Occurence.findByPk(occurenceId);
  if (!occurence) throw new Error("Occurence introuvable");

  const start = safeParseDate(advert.startDate);
  const end = safeParseDate(advert.endDate);
  const days = differenceInCalendarDays(end, start) + 1;

  const factor = isOccurenceAFrequence(occurence.label) ? days : 1;
  const addedPrice = Number(price) * factor;

  const newTotal = Number(contract.total_price || 0) + addedPrice;

  await contract.update({
    total_price: newTotal,
    owner_validation: false // reset validation
  });

  return newLink;
};

const removeServiceOccurenceFromOffer = async (offerId, osoId) => {
  const oso = await OfferServiceOccurence.findByPk(osoId);

  if (!oso) {
    throw { status: 404, message: 'Lien service/occurence non trouvé.' };
  }

  if (oso.offerId !== parseInt(offerId, 10)) {
    throw { status: 403, message: "Ce lien n'appartient pas à cette offre." };
  }

  const offer = await Offer.findByPk(offerId, {
    include: {
      model: AdvertOfferContract,
      include: [
        {
          model: Contract,
          through: ContractAdvertOfferContract
        },
        'Advert'
      ]
    }
  });

  if (!offer) {
    throw new Error("Offre introuvable.");
  }

  const aoc = offer.AdvertOfferContracts?.[0];
  if (!aoc || !aoc.Contract || !aoc.Advert) {
    throw new Error("Lien vers le contrat ou l'annonce manquant.");
  }

  const contract = aoc.Contract;
  const advert = aoc.Advert;

  const occurence = await Occurence.findByPk(oso.occurenceId);
  if (!occurence) {
    throw new Error("Occurence introuvable.");
  }

  const start = safeParseDate(advert.startDate);
  const end = safeParseDate(advert.endDate);
  const days = differenceInCalendarDays(end, start) + 1;

  const factor = isOccurenceAFrequence(occurence.label) ? days : 1;
  const reduction = Number(oso.price) * factor;

  // Mise à jour du contrat
  const newTotal = Number(contract.total_price || 0) - reduction;

  await contract.update({
    total_price: newTotal >= 0 ? newTotal : 0,
    owner_validation: false
  });

  // Suppression du lien
  await oso.destroy();
};

const modifyServiceOccurenceOnOffer = async (offerId, osoId, serviceId, occurenceId, price) => {
  const oso = await OfferServiceOccurence.findByPk(osoId);

  if (!oso) throw new Error('Lien service/occurence non trouvé.');

  if (oso.offerId !== parseInt(offerId, 10)) {
    throw new Error("Ce lien n'appartient pas à cette offre.");
  }

  // On récupère l'offre avec les liens nécessaires
  const offer = await Offer.findByPk(offerId, {
    include: {
      model: AdvertOfferContract,
      include: [
        {
          model: Contract,
          through: ContractAdvertOfferContract
        },
        'Advert'
      ]
    }
  });

  if (!offer) {
    throw new Error('Offre non trouvée');
  }

  const aoc = offer.AdvertOfferContracts?.[0];
  if (!aoc || !aoc.Contract || !aoc.Advert) {
    throw new Error("Contrat ou annonce liés introuvables pour cette offre");
  }

  const contract = aoc.Contract;
  const advert = aoc.Advert;

  const start = safeParseDate(advert.startDate);
  const end = safeParseDate(advert.endDate);
  const days = differenceInCalendarDays(end, start) + 1;

  // On récupère l’occurrence pour savoir si c’est une fréquence ou un forfait
  const occ = await Occurence.findByPk(occurenceId);
  if (!occ) throw new Error("Occurence introuvable");

  const factor = isOccurenceAFrequence(occ.label) ? days : 1;

  // Ancien facteur (à retirer du prix total)
  const oldOcc = await Occurence.findByPk(oso.occurenceId);
  const oldFactor = isOccurenceAFrequence(oldOcc.label) ? days : 1;

  // Mise à jour du lien
  const oldPrice = oso.price;
  await oso.update({
    serviceId,
    occurenceId,
    price,
  });

  const newTotal = contract.total_price - (oldPrice * oldFactor) + (price * factor);

  await contract.update({
    total_price: newTotal,
    owner_validation: false,
  });

  return oso;
};

module.exports = {
  addServiceOccurenceToOffer,
  removeServiceOccurenceFromOffer,
  modifyServiceOccurenceOnOffer
};