const { getKnex } = require("../db");

async function getMentors(statusesFilter, selectedFields) {
  const knex = getKnex();
  const query = knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .select(selectedFields);

  return await query.whereIn("mentors.status", statusesFilter);
}

async function getMentorByUserId(userId) {
  const knex = getKnex();
  return await knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .where("users.id", userId)
    .first();
}

async function createMentor(mentorData) {
  const knex = getKnex();
  const [mentor] = await knex("mentors")
    .insert(mentorData)
    .returning("*");
    
    return mentor;
}

module.exports = { getMentors, createMentor, getMentorByUserId };