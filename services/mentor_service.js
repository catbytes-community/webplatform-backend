const repo = require('../repositories/mentor_repository');
const rolesService = require('../services/roles_service');
const { MentorAlreadyExistsError, DataRequiresElevatedRoleError } = require("../errors");
const { ROLE_NAMES } = require("../utils");

const MENTOR_STATUSES = {
  active: 'active',
  inactive: 'inactive',
  rejected: 'rejected',
  pending: 'pending',
};

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

const adminVisibleStatuses = [MENTOR_STATUSES.active, MENTOR_STATUSES.inactive, MENTOR_STATUSES.rejected, MENTOR_STATUSES.pending];
const generalVisitbleStatuses = [MENTOR_STATUSES.active];

const allFields = [...baseFields, ...privateFields];

async function createMentor(userId, mentorData) {
  const existingMentor = await repo.getMentorByUserId(userId);
  if (existingMentor) {
    throw new MentorAlreadyExistsError(`User already has a mentor profile: id ${existingMentor.id}`);
  }

  const mentor = {
    user_id: userId,
    status: 'pending',
    about: mentorData.about,
    contact: mentorData.contact,
  };
  const createdMentor = await repo.createMentor(mentor);
  // todo: send email to admins
  return createdMentor;
}

async function getMentors(userId, status, includeAdditionalFields) {
  const userRoles = userId ? await rolesService.getUserRoles(userId) : [];
  const allowedStatuses = await getEligibleMentorStatuses(userRoles);

  const selectedFields = includeAdditionalFields
    ? allFields
    : baseFields;

  if (status && !allowedStatuses.includes(status)) {
    throw new DataRequiresElevatedRoleError('Requested data requires elevated role');
  }
  const statusesFilter = status ? [status] : allowedStatuses;

  return await repo.getMentors(statusesFilter, selectedFields);
}

async function getEligibleMentorStatuses(userRoles) {
  const isAdmin = userRoles.some(role => role.role_name === ROLE_NAMES.admin);
  if (isAdmin) {
    return adminVisibleStatuses;
  } else {
    return generalVisitbleStatuses;
  }
}

module.exports = { 
  getMentors, createMentor,
  adminVisibleStatuses, generalVisitbleStatuses,
  allFields, baseFields, privateFields,
  MENTOR_STATUSES
};