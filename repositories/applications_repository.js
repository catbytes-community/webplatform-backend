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

async function updateApplicationStatus(id, status, comment, modifiedBy, modifiedAt) {
  return await knex('applications')
    .where({ id })
    .update({ status: status, comment: comment, modified_by: modifiedBy, modified_at: modifiedAt })
    .returning('*');
}

module.exports = { getAllApplications, createNewApplication, updateApplicationStatus };