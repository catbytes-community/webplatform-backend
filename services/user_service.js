const pool = require("../db");
const utils = require('../utils');

async function assignRoleToUser(user_id, role_name){
    const role_id = utils.getRole(role_name);
    try {
        await pool.query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
            [user_id, role_id]);
    } catch (err) {
        throw new Error('Failed to assign role to user' + err.message);
    }
}

module.exports = { assignRoleToUser };