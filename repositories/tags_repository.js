const { getKnex } = require("../db");

async function getAllTags() {
  const knex = getKnex();
  const names = await knex('tags').pluck('name');
  return names;
}

module.exports = {
  getAllTags,
};