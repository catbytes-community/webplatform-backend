const { getKnex } = require("../db");

const knex = getKnex();

async function getAllApplications() {
  return await knex("applications").select("*"); 
}

async function createNewApplication(payload) {
  return await knex('applications')
    .insert(payload)
    .returning('*');
}

async function updateApplicationById(id, status, comment, modifiedBy, modifiedAt) {
  const [application] = await knex('applications')
    .where({ id })
    .update({ status: status, comment: comment, modified_by: modifiedBy, modified_at: modifiedAt })
    .returning('*');
  return application;
}

async function getApplicationByFields(fields) {
  return await knex('applications')
    .where(fields)
    .first();
}

module.exports = { getAllApplications, createNewApplication, updateApplicationById, getApplicationByFields };