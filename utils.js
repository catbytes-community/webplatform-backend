let rolesCache = null;
const repo = require('./repositories/roles_repository');

const ROLE_NAMES = {
    mentor: 'mentor',
    member: 'member'
}
async function loadRolesIntoMemory() {
    try {
        if (!rolesCache) {
            const roles = await repo.getAllRoles();
            rolesCache = roles.reduce((acc, role) => {
                acc[role.role_name] = role.id;
                if (!isRoleExists(role.role_name)) {
                    console.warn(`Role ${role.role_name} is in database, but is not in the ROLE_NAMES enum.`)
                }
                return acc;
            }, {});
            console.log('Roles loaded into memory:', rolesCache);
        }
    } catch (error) {
        console.error('Error loading roles:', error);
        throw new Error('Failed to initialize roles');
    }
}
function getRole(role_name) {
    if (!rolesCache) {
        throw new Error('Roles are not loaded');
    }
    return rolesCache[role_name]
}
function isRoleExists(role) {
    return Object.values(ROLE_NAMES).includes(role);
}

module.exports = { isRoleExists, ROLE_NAMES, loadRolesIntoMemory, getRole };