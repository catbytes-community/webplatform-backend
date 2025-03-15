const { getKnex } = require("../db");

const knex = getKnex();

async function getAllApplications() {
  return await knex("applications").select("*"); 
}

async function createNewApplication(name, about, email, videoLink, discordNickname) {
  return await knex('applications')
    .insert({ name: name, about: about, email: email, video_link: videoLink, discord_nickname: discordNickname })
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