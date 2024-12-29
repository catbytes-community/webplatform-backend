const { getKnex } = require("../db");
const knex = getKnex();

async function getAllUsers() {
	return await knex("users").select("id", "name", "languages");
}
 
async function createNewUser(name, email, about, languages) {
	const [user] = await knex("users").insert({ name, email, about, languages }).returning("*");
	return user;
}
async function getUserInfoById(id) {
	return await knex("users").where("id", id).first();
}

async function getUserInfoByField(query) {
	return await knex("users").where(query).first();
}

async function getUserRolesById(id) {
	return await knex("roles")
		.join("user_roles", "roles.id", "user_roles.role_id")
		.where("user_roles.user_id", id)
		.select("roles.role_name", "roles.id");
}
async function updateUserById(id, updates) {
	return await knex("users")
		.where("id", id)
		.update(updates)
		.returning("*");
}
async function deleteUserById(id) {
	return await knex("users").where("id", id).del();
}
async function getUserByEmail(email) {
	return await knex("users")
		.where({ email: email })
		.first();
}
module.exports = { getAllUsers, createNewUser, getUserInfoById, getUserRolesById, updateUserById, 
	deleteUserById, getUserByEmail, getUserInfoByField };