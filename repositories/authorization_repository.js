const { getKnex } = require("../db");

async function verifyRole(userId, roleId) {
    const knex = getKnex();
    return await knex("user_roles").where("user_id", userId).andWhere("role_id", roleId).select("*");
}

async function verifyOwnership(entityTable, resourceId, userId) {
    const knex = getKnex();
    return await knex(entityTable).where("id", resourceId).andWhere("created_by", userId).select("*");
}
module.exports = { verifyRole, verifyOwnership };