const { getKnex } = require("../db");

async function verifyRole(userId, roleId) {
  const knex = getKnex();
  return await knex("user_roles").where("user_id", userId).andWhere("role_id", roleId).select("*");
}

async function verifyOwnership(entityTable, resourceId, userId) {
  const knex = getKnex();
  return await knex(entityTable).where("id", resourceId).andWhere("created_by", userId).select("*");
}

async function userIsAdmin(userId) {
  const knex = getKnex();
  const adminRole = await knex("roles")
    .where("role_name", "admin")
    .first();   
  if (!adminRole) return false;
  
  return verifyRole(userId, adminRole.id);
}

module.exports = { verifyRole, verifyOwnership, userIsAdmin };