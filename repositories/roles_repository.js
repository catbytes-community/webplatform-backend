const { getKnex } = require("../db");
async function getAllRoles() {
    const knex = getKnex();
    return await knex('roles').select('*');
}
async function assignRoleToUser(user_id, role_id) {
    const knex = getKnex();
    await knex("user_roles").insert({ role_id, user_id });
}

module.exports = { getAllRoles, assignRoleToUser };