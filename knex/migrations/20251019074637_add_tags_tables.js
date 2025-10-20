/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema
    .createTable('tags', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
    });
  await knex.schema
    .createTable('tags_assigned', function(table) {
      table.primary(['tag_id', 'assigned_id', 'assigned_to']);
      table.integer('tag_id').unsigned().notNullable();
      table.integer('assigned_id').unsigned().notNullable();
      table.enu('assigned_to', ['mentor', 'project', 'study_buddy']).notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('tags_assigned');
  await knex.schema.dropTableIfExists('tags');
};
