const { getKnex } = require("../db");

async function getAllUsers() {
  const knex = getKnex();
  return await knex("users").select("id", "name", "languages");
}

async function createNewUser(values) {
  const knex = getKnex();
  const [user] = await knex("users")
    .insert(values)
    .returning("*");
  delete user["firebase_id"];
  return user;
}

async function getUserInfoById(id, safeOutput = true) {
  const knex = getKnex();
  const user = await knex("users")
    .leftJoin("mentors", "users.id", "mentors.user_id")
    .select(
      "users.*",
      "mentors.id as mentor_id",
      knex.raw("CASE WHEN mentors.status = 'active' THEN TRUE ELSE FALSE END AS is_mentor_active")
    )
    .where("users.id", id)
    .first();
  if (user !== undefined && safeOutput){
    delete user["firebase_id"];
  }
  return user;
}

async function getUserByFields(fields) {
  const knex = getKnex();
  const user = await knex("users").where(fields).first();
  if (user !== undefined) {
    delete user["firebase_id"];
  }
  return user;
}

async function updateUserById(id, updates) {
  const knex = getKnex();
  const [user] = await knex("users")
    .where("id", id)
    .update(updates)
    .returning("*");
  if (user !== undefined){
    delete user["firebase_id"];
  }
  return user;
}

async function deleteUserById(id) {
  const knex = getKnex();
  return await knex("users").where("id", id).del();
}

module.exports = { getAllUsers, createNewUser, getUserInfoById, updateUserById, 
  deleteUserById, getUserByFields };
