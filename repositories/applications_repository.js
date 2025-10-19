const { getKnex } = require("../db");

async function getAllApplications() {
  const knex = getKnex();
  return await knex("applications").select("*"); 
}

async function createNewApplication(payload) {
  const knex = getKnex();
  return await knex('applications')
    .insert(payload)
    .returning('*');
}

async function updateApplicationById(id, status, comment, modifiedBy, modifiedAt) {
  const knex = getKnex();
  const [application] = await knex('applications')
    .where({ id })
    .update({ status: status, comment: comment, modified_by: modifiedBy, modified_at: modifiedAt })
    .returning('*');
  return application;
}

async function getApplicationByFields(fields) {
  const knex = getKnex();
  return await knex('applications')
    .where(fields)
    .first();
}

async function deleteApplicationById(id) {
  const knex = getKnex();
  return await knex("applications").where("id", id).del();
}

module.exports = { getAllApplications, createNewApplication, updateApplicationById, getApplicationByFields, deleteApplicationById };