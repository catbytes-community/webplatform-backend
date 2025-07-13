const { getKnex } = require("../db");

async function getMentors(allowedStatuses, status, selectedFields){
  const knex = getKnex();
  const query = knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .select(selectedFields);
  if (status) 
  {
    query.where("mentors.status", status);
  }
  else
  {
    query.whereIn("mentors.status", allowedStatuses);
  }
  return await query;
}

async function mentorAlreadyExists(userId)
{
  const knex = getKnex(); 
  const mentor = await knex("mentors")
    .where("user_id", userId)
    .first();

  return !!mentor;
}

async function getMentorById(allowedStatuses, selectedFields, mentorId){
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

async function getMentorsEmails() {
  const knex = getKnex();
  return await knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .where("mentors.status", "active")
    .pluck("users.email");
}

module.exports = { getMentors, getMentorById, createMentor, getMentorsEmails, mentorAlreadyExists};