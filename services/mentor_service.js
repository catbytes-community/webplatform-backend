const repo = require('../repositories/mentor_repository');
const rolesService = require('../services/roles_service');
const mailerService = require('../services/mailer_service');
const { MentorAlreadyExistsError, DataRequiresElevatedRoleError } = require("../errors");
const { ROLE_NAMES, MENTOR_STATUSES } = require("../utils");
const { assignRoleToUser, removeRoleFromUser } = require('../repositories/roles_repository');

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

const adminVisibleStatuses = [MENTOR_STATUSES.active, MENTOR_STATUSES.inactive, 
  MENTOR_STATUSES.rejected, MENTOR_STATUSES.pending];
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
  const mentorInfo = await repo.createMentor(mentor);

  const adminEmails = await rolesService.getAdminEmails();
  await mailerService.sendEmailOnNewMentorApplication(adminEmails, mentorInfo);
  return mentorInfo.id;
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

async function getMentorById(userRoles, mentorId, isOwner) {
  const allowedStatuses = await getEligibleMentorStatuses(userRoles, isOwner);
  return repo.getMentorById(allowedStatuses, allFields, mentorId);
}

async function getEligibleMentorStatuses(userRoles, isOwner) {
  const isAdmin = userRoles.some(role => role.role_name === ROLE_NAMES.admin);
  if (isAdmin || isOwner) {
    return adminVisibleStatuses;
  } else {
    return generalVisitbleStatuses;
  }
}

async function updateMentorStatus(userRoles, mentorId, status, isOwner) {
  const mentorData = await getMentorById(userRoles, mentorId, isOwner);
  const isAdmin = userRoles.some(role => role.role_name === ROLE_NAMES.admin);
  const allowedStatusesForOwner = [
    MENTOR_STATUSES.active,
    MENTOR_STATUSES.inactive,
  ];

  if(isAdmin) {
    let updatedMentorId;
    // if admin approves mentor (pending -> active -> add mentor role)
    if(mentorData.status === MENTOR_STATUSES.pending && status === MENTOR_STATUSES.active) {
      updatedMentorId = await repo.updateMentorById(mentorId, { status });
      assignRoleToUser(mentorData.user_id, 2);
    } else if(status === MENTOR_STATUSES.rejected) {
      // if admin rejects mentor (change mentor status to rejected => remove mentor role)
      updatedMentorId = await repo.updateMentorById(mentorId, { status });
      removeRoleFromUser(mentorData.user_id, 2);
    } else {
      // any other status changes allowed without side effect actions
      updatedMentorId = await repo.updateMentorById(mentorId, { status });
    }
    return updatedMentorId;
  }
  if(isOwner) {
    if(allowedStatusesForOwner.includes(status)) {
      if(![MENTOR_STATUSES.pending, MENTOR_STATUSES.rejected].includes(mentorData.status)) {
        return repo.updateMentorById(mentorId, { status });
      }
    };
  };

  throw new DataRequiresElevatedRoleError("You're not allowed to edit this resource");
}

async function updateMentor(mentorId, updates) {
  const updatedMentorId = await repo.updateMentorById(mentorId, updates);
  return updatedMentorId;
}

module.exports = { 
  getMentors, createMentor, getMentorById,
  updateMentorStatus, updateMentor,
  adminVisibleStatuses, generalVisitbleStatuses,
  allFields, baseFields, privateFields,
  MENTOR_STATUSES
};