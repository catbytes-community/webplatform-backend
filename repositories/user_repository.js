const { getKnex } = require("../db");
 
async function getAllUsers() {
	const knex = getKnex();
	return await knex("users").select("id", "name", "languages");
}
async function assignRoleToUser(user_id, role_id) {
	const knex = getKnex();
	await knex("user_roles").insert({ role_id, user_id });
}
async function createNewUser(name, email, about, languages) {
	const knex = getKnex();
	const [user] = await knex("users").insert({ name, email, about, languages }).returning("id");
	return user.id;
}
async function getUserInfoById(id) {
	const knex = getKnex();
	return await knex("users").where("id", id).first();
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
		.update({name, about, languages })
		.returning("*");
	
}
async function deleteUserById(id) {
	const knex = getKnex();
	return await knex("users").where("id", id).del();
}
module.exports = { assignRoleToUser, getAllUsers, createNewUser, getUserInfoById, getUserRolesById, updateUserById, deleteUserById };

 