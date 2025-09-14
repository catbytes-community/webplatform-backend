const repo = require('../repositories/mentor_repository');
const mailerService = require('../services/mailer_service');
const rolesService = require('../services/roles_service');
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

const adminVisibleStatuses = ['active', 'inactive', 'rejected', 'pending'];
const memberVisibleStatuses = ['active'];

const allFields = [...baseFields, ...privateFields];

async function getMentors(userId, status, includeAdditionalFields) {
  const userRoles = await rolesService.getUserRoles(userId);
  const allowedStatuses = await getEligibleMentorStatuses(userRoles);

  const selectedFields = includeAdditionalFields
    ? allFields
    : baseFields;

  return await repo.getMentors(allowedStatuses, status, selectedFields);
}

async function getMentorById(userRoles, mentorId) {
  // todo owner should be able to see their own profile
  const allowedStatuses = await getEligibleMentorStatuses(userRoles);
  return await repo.getMentorById(allowedStatuses, allFields, mentorId);
}

async function createMentor(userId, mentorData) {
  // check if user already has a mentor profile
  const existingMentor = await repo.getMentorByUserId(userId);
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
  const adminEmails = await repo.getAdminEmails();
  // send email notification to all admins
  await mailerService.notifyAdminsAboutNewApplication(createdMentor, adminEmails);
  return createdMentor;
}

async function getEligibleMentorStatuses(userRoles) {
  const isAdmin = userRoles.some(role => role.role_name === ROLE_NAMES.admin);
  if (isAdmin) {
    return adminVisibleStatuses;
  } else {
    return memberVisibleStatuses;
  }
}

module.exports = { 
  getMentors, getMentorById, createMentor,
  adminVisibleStatuses, memberVisibleStatuses
};