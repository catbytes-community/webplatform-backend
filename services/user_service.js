//const { getPool } = require('../db');
//const pool = getPool();
//const utils = require('../utils');
const rolesService = require('./roles_service');
const repo = require('../repositories/user_repository');

async function assignRoleToUser(userId, roleName) {
    try {
        const roleId = rolesService.getRole(roleName);
      await repo.assignRoleToUser(userId, roleId);
    } catch (err) {
        throw new Error(`Failed to assign role to user ${userId}:  ${err.message}`);
    }
}
async function getAllUsers() {

    return await repo.getAllUsers();
}
async function createNewUser(name, email, about, languages) {
    return await repo.createNewUser(name, email, about, languages);
}
async function getUserById(id) {
    let userInfo = await repo.getUserInfoById(id) || {};

    if (!userInfo) {

        const roles = await repo.getUserRolesById(id);
        userInfo.roles = roles.length > 0 ? roles : [];
     
    };
    return userInfo;
}
async function updateUserById(id, name, about, languages) {
    return await repo.updateUserById(id, name, about, languages )   
}

async function deleteUserById(id) {
    return await repo.deleteUserById(id);
}

module.exports = { assignRoleToUser, getAllUsers, createNewUser, getUserById, updateUserById, deleteUserById };