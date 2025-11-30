const { getKnex } = require("../db");

async function getAllRoles() {
  const knex = getKnex();
  return await knex('roles').select('*');
}

async function assignRoleToUser(userId, roleId) {
  const knex = getKnex();
  await knex("user_roles")
    .insert({ role_id: roleId, user_id: userId });
}

async function removeRoleFromUser(userId, roleId) {
  const knex = getKnex();
  await knex("user_roles")
    .where({ user_id: userId, role_id: roleId })
    .del();
}

async function removeAllRolesFromUser(userId) {
  const knex = getKnex();
  await knex("user_roles")
    .where({ user_id: userId })
    .del();
}

async function getEmailsByRole(role) {
  const knex = getKnex();
  return await knex("user_roles")
    .join("roles", "user_roles.role_id", "roles.id")
    .join("users", "user_roles.user_id", "users.id")
    .where("roles.role_name", role)
    .pluck("users.email");
}

module.exports = { getAllRoles, assignRoleToUser, removeRoleFromUser, removeAllRolesFromUser, getEmailsByRole };