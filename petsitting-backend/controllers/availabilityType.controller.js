const service = require('../services/availabilityType.service');

const create = async (req, res) => {
  try {
    const petsitterId = req.user.id;
    const data = req.body;
    const type = await service.create(data, petsitterId);
    res.status(201).json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    await service.update(id, updates);
    res.status(200).json({ message: 'Availability type updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await service.remove(id);
    res.status(200).json({ message: 'Availability type deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const list = async (req, res) => {
  try {
    const petsitterId = req.user.id;
    const types = await service.listByPetsitter(petsitterId);
    res.status(200).json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { create, update, remove, list };