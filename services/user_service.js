const { getPool } = require('../db');
const pool = getPool();
const utils = require('../utils');

async function assignRoleToUser(userId, roleName){
    const roleId = utils.getRole(roleName);
    try {
        await pool.query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
            [userId, roleId]);
    } catch (err) {
        throw new Error(`Failed to assign role to user ${userId}:  ${err.message}`);
    }
}

module.exports = { assignRoleToUser };