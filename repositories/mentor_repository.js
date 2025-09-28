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

async function getMentorById(allowedStatuses, selectedFields, mentorId) {
  const knex = getKnex();
  return await knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .where("mentors.id", mentorId)
    .whereIn("mentors.status", allowedStatuses)
    .select(selectedFields).first();
}

async function createMentor(mentorData) {
  const knex = getKnex();
  const [res] = await knex("mentors")
    .insert(mentorData)
    .returning("id");

  return res.id;
}

async function updateMentorStatus(mentorId, status) {
  const knex = getKnex();
  return await knex("mentors")
    .where("id", mentorId)
    .update({ status });
}

module.exports = { getMentors, createMentor, getMentorByUserId, getMentorById, updateMentorStatus };