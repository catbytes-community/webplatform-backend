/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex('roles')
    .insert({
      role_name: 'admin',
      is_privileged: true
    })
    .onConflict('role_name')
    .ignore();
};
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex('roles')
    .where('role_name', 'admin')
    .del();
};