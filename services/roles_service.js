const repo = require('../repositories/roles_repository');
const utils = require('../utils');
async function assignRoleToUser(userId, roleName) {
    try {
        const roleId = utils.getRole(roleName);
        await repo.assignRoleToUser(userId, roleId);
    } catch (err) {
        throw new Error(`Failed to assign role to user ${userId}:  ${err.message}`);
    }
}
async function getAllRoles() {
    return await repo.getAllRoles();
}
module.exports = { getAllRoles, assignRoleToUser };