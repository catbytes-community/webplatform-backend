/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('users', function(table) {  
    table.string('name', 100).notNullable().alter();
    table.string('email', 100).notNullable().alter();
    
    table.string('firebase_id', 255);
    table.string('discord_nickname', 50).notNullable().unique();
  });

  await knex.raw(`
    ALTER TABLE users ADD CONSTRAINT chk_not_empty_name CHECK (name <> '');
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.raw(`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_not_empty_name;
  `);

  await knex.schema.alterTable('users', function(table) {
    table.dropColumn('firebase_id');
    table.dropColumn('discord_nickname');

    table.string('name', 255).nullable().alter();
    table.string('email', 255).nullable().alter();
  });
};
