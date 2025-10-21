const repo = require('../repositories/user_repository');
const rolesService = require('../services/roles_service');
const mentorService = require('../services/mentor_service');
const applicationService = require('../services/applications_service');
const mailerService = require('../services/mailer_service');
const s3client = require('../aws/s3_client');
const firebaseAdmin = require('firebase-admin');

const logger = require('../logger')(__filename);

async function getAllUsers() {

  return await repo.getAllUsers();
}

async function createNewMemberUser(name, email, about, languages, discordNickname) {
  var user = await repo.createNewUser({ name: name, email: email, about: about, 
    languages: languages, discord_nickname: discordNickname });
  await rolesService.assignRoleToUser(user.id, 'member');
  return user;
}

async function getUserById(id) {
  const userInfo = await repo.getUserInfoById(id);
  if (userInfo) {
    const roles = await rolesService.getUserRoles(id);
    userInfo.roles = roles.length ? roles : [];    
  }
  return userInfo;
}

async function updateUserById(id, updates) {
  return await repo.updateUserById(id, updates);   
}

async function deleteUserById(id) {
  const user = await repo.getUserInfoById(id, false);
  if (!user) {
    return 0;
  }
  const application = await applicationService.getApplicationByEmail(user.email);
  try {
    // todo add transaction support
    await mentorService.deleteMentorById(user.mentor_id);
    await rolesService.deleteAllUserRoles(id);
    
    await applicationService.deleteApplicationById(application.id);
  } catch (error) {
    throw new Error(`Failed to delete user associated data: ${error.message}`);
  }

  if (application?.video_filename) {
    await s3client.deleteObject(s3client.BUCKET_PREFIXES.applications, application.video_filename);
  }

  firebaseAdmin.auth().deleteUser(user.firebase_id).catch((error) => {
    logger.error({ error: error.message }, `Failed to delete Firebase user with ID ${user.firebase_id}`);
  });

  await mailerService.sendUserDeletionEmail(user.email, user.name);
  return await repo.deleteUserById(id);
}  

async function getUserByFirebaseId(firebaseId) {
  return await repo.getUserByFields({firebase_id: firebaseId});
}

async function getUserByEmail(email) {
  return await repo.getUserByFields({email: email});
}

async function getUserFirebaseId(id) {
  const user = await repo.getUserInfoById(id, false);
  return user?.firebase_id;
}

module.exports = { getAllUsers, createNewMemberUser, getUserById, updateUserById, deleteUserById, 
  getUserByEmail, getUserByFirebaseId, getUserFirebaseId };