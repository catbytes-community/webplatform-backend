/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

/// adding img column to users table and updating role names to lowercase

exports.up = async function(knex) {
  await knex.schema.alterTable('users', function(table) {
    table.string('img', 255);
  });

  await knex('roles')
    .where('role_name', 'Member')
    .update({ role_name: 'member' });

  await knex('roles')
    .where('role_name', 'Mentor')
    .update({ role_name: 'mentor' });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('users', function(table) {
    table.dropColumn('img');
  });

  await knex('roles')
    .where('role_name', 'member')
    .update({ role_name: 'Member' });

  await knex('roles')
    .where('role_name', 'mentor')
    .update({ role_name: 'Mentor' });
};
