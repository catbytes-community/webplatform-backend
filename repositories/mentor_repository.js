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

async function getMentorById(allowedStatuses, selectedFields, mentorId, safeOutput = true) {
  const knex = getKnex();
  const mentor = await knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .where("mentors.id", mentorId)
    .whereIn("mentors.status", allowedStatuses)
    .select(selectedFields).first();

  if (mentor !== undefined && safeOutput) {
    delete mentor["email"];
  }
  
  return mentor;
}

async function createMentor(mentorData) {
  const knex = getKnex();

  return await knex.transaction(async (trx) => {
    const [createdMentor] = await trx("mentors")
      .insert(mentorData)
      .returning("id");

    const result = await trx("mentors")
      .join("users", "mentors.user_id", "users.id")
      .select("mentors.id", "users.name", "mentors.about")
      .where("mentors.id", createdMentor.id)
      .first();

    return result;
  });
}

async function updateMentorById(mentorId, updates) {
  const knex = getKnex();

  const [mentor] = await knex("mentors")
    .where("id", mentorId)
    .update(updates)
    .returning("id");
  return mentor.id;
}

async function deleteMentorById(id) {
  const knex = getKnex();
  return await knex("mentors").where("id", id).del();
}

module.exports = { getMentors, createMentor, getMentorByUserId, getMentorById, updateMentorById, deleteMentorById };