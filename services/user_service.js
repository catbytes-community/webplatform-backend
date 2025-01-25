const repo = require('../repositories/user_repository');
const rolesService = require('../services/roles_service');

async function getAllUsers() {

  return await repo.getAllUsers();
}

async function createNewUser(name, email, about, languages, role) {
  var user = await repo.createNewUser(name, email, about, languages);
  await rolesService.assignRoleToUser(user.id, role);
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
  return await repo.updateUserById(id, updates )   
}

async function deleteUserById(id) {
  return await repo.deleteUserById(id);
}  

async function getUserByEmail(email) {
  return await repo.getUserByEmail(email);
}

module.exports = { getAllUsers, createNewUser, getUserById, updateUserById, deleteUserById, getUserByEmail };