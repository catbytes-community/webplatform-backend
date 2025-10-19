const { getKnex } = require("../db");

async function getAllTags() {
  const knex = getKnex();
  return knex('tags')
    .select('id', 'name');
}

module.exports = {
  getAllTags,
};