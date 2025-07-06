const { getKnex } = require("../db");
const userRepo = require('./user_repository');
const logger = require('../logger')(__filename);
const { ROLE_NAMES } = require("../utils");

async function getMentors(userId, status){
  const knex = getKnex();
  const userRoles = userRepo.getUserRolesById(userId);
  const isAdmin = userRoles.includes(ROLE_NAMES.admin);
  const allowedStatuses = getEligibleMentorStatuses(isAdmin).where(status);
  return await knex("mentors")
    .join("users", "mentors.user_id", "users.id")
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
    );
 
}

async function getMentorById(userId, mentorId){
  const knex = getKnex();
  try
  {
 
    const userRoles = userRepo.getUserRolesById(userId);
 
    const isAdmin = userRoles.some(role => role.role_name === ROLE_NAMES.admin);
    const allowedStatuses = getEligibleMentorStatuses(isAdmin);
   
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
    logger.error(`Failed to get mentorship card ${mentorId} for user ${userId}:`, err);
    throw err;
  }
}

async function getEligibleMentorStatuses(isAdmin)
{
  if (isAdmin) return ['active', 'inactive', 'rejected', 'pending'];
  else return ['active', 'inactive'];
}

async function createMentor(mentorData) {
  const knex = getKnex();
  logger.debug(mentorData);
  const [mentor] = await knex("mentors")
    .insert({
      user_id: mentorData.user_id,
      about: mentorData.about,
      contact: mentorData.contact || null,
      status: 'pending'
    })
    .returning("*");

  logger.debug(mentor);
  return getMentorById(mentor.id);

}

async function getMentorsEmails() {
  const knex = getKnex();
  return await knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .where("mentors.status", "active")
    .pluck("users.email");
}

module.exports = { getMentors, getMentorById, createMentor, getMentorsEmails};