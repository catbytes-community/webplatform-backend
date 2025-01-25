const { getKnex } = require("../db");

const knex = getKnex();

async function getAllUsers() {
  return await knex("users").select("id", "name", "languages");
}

async function createNewUser(name, email, about, languages) {
  const knex = getKnex();
  const [user] = await knex("users")
  	.insert({ name: name, email: email, about: about, languages: languages })
    .returning("id");
  return user.id;
}

async function getUserInfoById(id) {
  const knex = getKnex();
  return await knex("users").where("id", id).first();
}

async function getUserByEmail(email) {
  return await knex("users")
    .where({ email })
    .first();
}

async function getUserRolesById(id) {
  const knex = getKnex();
  return await knex("roles")
    .join("user_roles", "roles.id", "user_roles.role_id")
    .where("user_roles.user_id", id)
    .select("roles.role_name", "roles.id");
}

async function updateUserById(id, name, about, languages) {
  const knex = getKnex();
  return await knex("users")
    .where("id", id)
    .update({name: name, about: about, languages: languages })
    .returning("*");
}

async function deleteUserById(id) {
  return await knex("users").where("id", id).del();
}

module.exports = { getAllUsers, createNewUser, getUserInfoById, getUserRolesById, updateUserById, 
  deleteUserById, getUserByEmail };