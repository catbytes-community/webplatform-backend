const pool = require("./db");

let rolesCache = null;

const loadRolesIntoMemory = async (req, res, next) => {
    try {
        if (!rolesCache){
            const roles = await pool.query("SELECT * FROM roles");
            console.log(roles);
            rolesCache = roles.rows.reduce((acc, role) => {
                acc[role.role_name] = role.role_id;
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

module.exports = { loadRolesIntoMemory, getRole };