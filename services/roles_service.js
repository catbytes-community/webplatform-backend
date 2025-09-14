const repo = require('../repositories/roles_repository');
const authRepo = require('../repositories/authorization_repository');
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

async function getAllRoles() {
  return await repo.getAllRoles();
}

module.exports = { getAllRoles, assignRoleToUser, getUserRoles };