/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('discord_links', function (table) {
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('link').notNullable();
    table.timestamp('link_sent_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('discord_links');
};
