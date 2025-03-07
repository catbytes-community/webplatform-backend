/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('discord_links', function (table) {
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('link', 100).notNullable();
    table.timestamp('link_sent_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('discord_links');
};
