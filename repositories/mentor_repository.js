const { getKnex } = require("../db");

async function getMentors(allowedStatuses, status, selectedFields) {
  const knex = getKnex();
  const query = knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .select(selectedFields);

  const filter = status ? [status] : allowedStatuses;
  return await query.whereIn("mentors.status", filter);
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
  const [mentor] = await knex("mentors")
    .insert(mentorData)
    .returning("*");

  //get user name
  const user = await knex("users")
    .select("name")
    .where("id", mentor.user_id)
    .first();
  return {
    ...mentor,
    name: user.name
  };
}

async function getAdminEmails() {
  const knex = getKnex();
  return await knex("user_roles")
    .join("roles", "user_roles.role_id", "roles.id")
    .join("users", "user_roles.user_id", "users.id")
    .where("roles.role_name", "admin")
    .pluck("users.email");
}

module.exports = { getMentors, getMentorById, createMentor, getAdminEmails, getMentorByUserId };