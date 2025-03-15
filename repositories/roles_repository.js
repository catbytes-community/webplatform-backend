const { getKnex } = require("../db");

async function getAllRoles() {
  const knex = getKnex();
  return await knex('roles').select('*');
}

async function assignRoleToUser(userId, roleId) {
  const knex = getKnex();
  await knex("user_roles").insert({ role_id: roleId, user_id: userId });
}

module.exports = { getAllRoles, assignRoleToUser };