/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  //creating status enums
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mentor_status') THEN
        CREATE TYPE mentor_status AS ENUM (
          'pending',
          'rejected',
          'active',
          'inactive'
        );
      END IF;
    END$$;
  `);

  await knex.schema.createTable('mentors', (table) => {
    table.increments('id').primary();
    table.integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('contact', 100);
    table.text('about');
    table.specificType('status', 'mentor_status').notNullable();
    table.timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table.integer('last_modified_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamp('last_modified_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('mentors');
  await knex.raw('DROP TYPE IF EXISTS mentor_status');
};
