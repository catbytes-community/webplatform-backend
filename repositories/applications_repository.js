const { getKnex } = require("../db");
 
async function getAllApplications() {
    const knex = getKnex();
    return await knex("applications").select("*"); 
}

async function createNewApplication(name, about, email, video_link, discord_nickname) {
    const knex = getKnex();
    return await knex('applications')
        .insert({ name, about, email, video_link, discord_nickname })
        .returning('*');
}

module.exports = { getAllApplications, createNewApplication };