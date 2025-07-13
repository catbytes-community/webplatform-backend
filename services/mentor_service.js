const repo = require('../repositories/mentor_repository');
const mailerService = require('../services/mailer_service');
const userRepo = require('../repositories/user_repository');
const { ROLE_NAMES } = require("../utils");

const baseFields = [
  'mentors.id as mentor_id',
  'mentors.user_id',
  'mentors.about',
  'mentors.status',
  'users.name',
  'users.img as img_link'
];

const privateFields = [
  'mentors.contact',
  'users.discord_nickname'
];

const allFields = [...baseFields, ...privateFields];

async function getMentors(userId, status, includeAdditionalFields){
  const allowedStatuses = await getEligibleMentorStatuses(userId); 
  const selectedFields = includeAdditionalFields 
    ? allFields
    : baseFields;
  return await repo.getMentors(allowedStatuses, status, selectedFields);
}

async function getMentorById(userId, mentorId){
  const allowedStatuses = await getEligibleMentorStatuses(userId);   
  return await repo.getMentorById(allowedStatuses, allFields, mentorId);
}

async function createMentor(userId, mentorData) {
  // check if user already has a mentor profile
  const existingMentor = await repo.mentorAlreadyExists(userId);
  if (existingMentor) {
    throw { status: 400, message: 'User already has a mentor profile' };
  }

  // create mentor with pending status
  const mentor = {
    user_id: userId,
    status: 'pending',
    about: mentorData.about,
    contact: mentorData.contact,
  };
  const createdMentor = await repo.createMentor(mentor);
  // get active mentor emails
  const activeMentorEmails = await repo.getMentorsEmails();
  // send email notification to all mentors
  await mailerService.notifyMentorsAboutNewApplication(createdMentor, activeMentorEmails);
  return createdMentor;
}

async function getEligibleMentorStatuses(userId)
{
  const userRoles = userId ? await userRepo.getUserRolesById(userId): [];
  const rolesArray = Array.isArray(userRoles) ? userRoles : [];
  const isAdmin = rolesArray.some(role => role.role_name === ROLE_NAMES.admin);
  if (isAdmin) {
    return ['active', 'inactive', 'rejected', 'pending'];
  } else {
    return ['active', 'inactive'];
  }
}

module.exports = { getMentors, getMentorById, createMentor };