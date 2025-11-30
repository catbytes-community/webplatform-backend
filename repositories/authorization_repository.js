const { getKnex } = require("../db");

async function verifyRole(userId, roleId) {
  const knex = getKnex();
  return await knex("user_roles").where("user_id", userId).andWhere("role_id", roleId).select("*");
}

async function getRolesByUserId(id) {
  const knex = getKnex();
  return await knex("roles")
    .join("user_roles", "roles.id", "user_roles.role_id")
    .where("user_roles.user_id", id)
    .select("roles.role_name", "roles.id as role_id");
}

async function verifyOwnership(entityTable, resourceId, userId, fieldToAssess) {
  const knex = getKnex();
  return await knex(entityTable).where("id", resourceId).andWhere(fieldToAssess, userId).select("*");
}

module.exports = { verifyRole, verifyOwnership, getRolesByUserId };