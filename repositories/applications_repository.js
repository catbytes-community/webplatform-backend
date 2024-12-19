const { getKnex } = require("../db");
const knex = getKnex();

async function getAllApplications() {
    return await knex("applications").select("*"); 
}

async function createNewApplication(name, about, email, video_link, discord_nickname) {
    return await knex('applications')
        .insert({ name, about, email, video_link, discord_nickname })
        .returning('*');
}

async function updateApplicationStatus(id, status, comment, modified_by, modified_at) {
    return await knex('applications')
        .where({ id })
        .update({ status, comment, modified_by, modified_at })
        .returning('*');
}
async function getApplicationByEmail(email) {
    return await knex('applications')
        .where("email", email)
        .first();
}
module.exports = { getAllApplications, createNewApplication, updateApplicationStatus, getApplicationByEmail };