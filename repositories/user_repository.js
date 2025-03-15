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

async function getUserInfoById(id) {
  const knex = getKnex();
  const user = await knex("users").where("id", id).first();
  if (user !== undefined){
    delete user["firebase_id"];
  }
  return user;
}

async function getUserByFields(fields) {
  const knex = getKnex();
  const user = await knex("users").where(fields).first();
  if (user !== undefined){
    delete user["firebase_id"];
  }
  return user;
}

async function getUserRolesById(id) {
  const knex = getKnex();
  return await knex("roles")
    .join("user_roles", "roles.id", "user_roles.role_id")
    .where("user_roles.user_id", id)
    .select("roles.role_name", "roles.id");
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

module.exports = { getAllUsers, createNewUser, getUserInfoById, getUserRolesById, updateUserById, 
  deleteUserById, getUserByFields };
