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
async function getUserRolesById(id) {
	return await knex("roles")
		.join("user_roles", "roles.id", "user_roles.role_id")
		.where("user_roles.user_id", id)
		.select("roles.role_name", "roles.id");
}
async function updateUserById(id, name, about, languages) {
	return await knex("users")
		.where("id", id)
		.update({name, about, languages })
		.returning("*");
	
}
async function deleteUserById(id) {
	return await knex("users").where("id", id).del();
}
async function getUserByEmail(email) {
	return await knex("users")
		.where({ email })
		.first();
}
async function updateUserFirebaseId(id, firebase_id) {
	return await knex("users")
		.where("id", id)
		.update({ firebase_id })
		.returning("*");
}
module.exports = { getAllUsers, createNewUser, getUserInfoById, getUserRolesById, updateUserById, deleteUserById, getUserByEmail, updateUserFirebaseId };