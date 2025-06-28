const repo = require('../repositories/user_repository');
const rolesService = require('../services/roles_service');

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
    const roles = await repo.getUserRolesById(id);
    userInfo.roles = roles.length ? roles : [];    
  }
  return userInfo;
}

async function updateUserById(id, updates) {
  return await repo.updateUserById(id, updates);   
}

async function deleteUserById(id) {
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