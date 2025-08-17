const { Evaluate, User } = require('../models');

const create = (data) => {
  return Evaluate.create(data);
};

const findByContractAndUser = (contractId, userId) => {
  return Evaluate.findOne({
    where: { contract_id: contractId, user_id: userId }
  });
};

const findByPetsitterId = async (petsitterId) => {
  return Evaluate.findAll({
    where: { target_user_id: petsitterId },
    include: [{ model: User, as: 'author', attributes: ['id', 'first_name', 'last_name'] }],
  });
};

async function deleteEvaluation(id) {
  return Evaluate.destroy({ where: { id } });
}

module.exports = {
  create,
  findByContractAndUser,
  findByPetsitterId,
  deleteEvaluation,
};