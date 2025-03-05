/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('applications', function(table) {
    table.string('name', 255).notNullable().alter();
    table.string('about', 255).notNullable().alter();
    
    table.string('email', 255).notNullable().unique();
    table.string('video_link', 255);
    table.string('discord_nickname', 255).notNullable().unique();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('applications', function(table) {
    table.dropColumn('email');
    table.dropColumn('video_link');
    table.dropColumn('discord_nickname');

    table.string('name', 255).nullable().alter();
    table.string('about', 255).nullable().alter();
  });
};
