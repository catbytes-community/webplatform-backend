const repo = require('../repositories/roles_repository');
const utils = require('../utils');
const authRepo = require('../repositories/authorization_repository');

async function assignRoleToUser(userId, roleName) {
  try {
    const roleId = utils.getRole(roleName);
    await repo.assignRoleToUser(userId, roleId);
  } catch (err) {
    throw new Error(`Failed to assign role to user ${userId}:  ${err.message}`);
  }
}

async function getUserRoles(userId) {
  return await authRepo.getRolesByUserId(userId) ?? [];
}

async function deleteAllUserRoles(userId) {
  return await repo.removeAllRolesFromUser(userId);
}

async function getAllRoles() {
  return await repo.getAllRoles();
}

async function getAdminEmails() {
  return await repo.getEmailsByRole(utils.ROLE_NAMES.admin);
}

module.exports = { getAllRoles, assignRoleToUser, getUserRoles, deleteAllUserRoles, getAdminEmails };