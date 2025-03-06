const { getKnex } = require("../db");


async function saveInviteInDB(userId, inviteLink) {
  const knex = getKnex();
  await knex("discord_links").insert({ user_id: userId, link: inviteLink });
}

async function getLastInviteTime(userId) {
  const knex = getKnex();
  const result = await knex("discord_links")
    .where("user_id", userId)
    .orderBy("link_sent_at", "desc") 
    .first("link_sent_at"); 

  return result ? result.link_sent_at : null; // return the date or null if no records exist
}

module.exports = { saveInviteInDB, getLastInviteTime };