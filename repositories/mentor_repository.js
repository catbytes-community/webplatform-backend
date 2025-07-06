const { getKnex } = require("../db");
const userRepo = require('./user_repository');
const logger = require('../logger')(__filename);
const { ROLE_NAMES } = require("../utils");

async function getMentors(userId, status){
  const knex = getKnex();
  const allowedStatuses = await getEligibleMentorStatuses(userId)
  const query = knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .select(
      "mentors.id as mentor_id",
      "mentors.user_id",
      "mentors.about",
      "mentors.status",
      "mentors.contact",
      "users.name",
      "users.img as img_link",
      "users.discord_nickname"
    );
   if (status) {
      if (!allowedStatuses.includes(status)) {
        throw new Error('Requested status not permitted');
      }
      query.where("mentors.status", status);
    } else {
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

async function getMentorById(userId, mentorId){
  const knex = getKnex();
  userId = 1;
  try
  {
    const allowedStatuses = await getEligibleMentorStatuses(userId);
    const mentor = await knex("mentors")
      .join("users", "mentors.user_id", "users.id")
      .where("mentors.id", mentorId)
      .whereIn("mentors.status", allowedStatuses)
      .select(
        "mentors.id as mentor_id",
        "mentors.user_id",
        "mentors.about",
        "mentors.status",
        "mentors.contact",
        "users.name",
        "users.img as img_link",
        "users.discord_nickname"
      ).first();

    if (!mentor) {
      throw new Error('Mentor not found or access denied');
    }
    return mentor;
  } catch (err) {
    logger.error(`Failed to get mentorship card for mentor ${mentorId}:`, err);
    throw err;
  }
}

async function getEligibleMentorStatuses(userId)
{

  const userRoles = userId ? await userRepo.getUserRolesById(userId): [];
  const rolesArray = Array.isArray(userRoles) ? userRoles : [];
  const isAdmin = rolesArray.some(role => role.role_name === ROLE_NAMES.admin);
  if (isAdmin) return ['active', 'inactive', 'rejected', 'pending'];
  else return ['active', 'inactive'];
}

async function createMentor(mentorData) {
  const knex = getKnex();
  return await knex("mentors")
    .insert({
      user_id: mentorData.user_id,
      about: mentorData.about,
      contact: mentorData.contact || null,
      status: 'pending'
    })
    .returning("*");
}

async function getMentorsEmails() {
  const knex = getKnex();
  return await knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .where("mentors.status", "active")
    .pluck("users.email");
}

module.exports = { getMentors, getMentorById, createMentor, getMentorsEmails, mentorAlreadyExists};