/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.raw(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM ('approved', 'rejected', 'pending');
      END IF;
    END $$;`);
  
  // knex enum application in query builder is buggy and is trying to create enum twice,
  // which ends up in error. hence using raw query
  await knex.raw(`ALTER TABLE applications
    ADD COLUMN status public.application_status DEFAULT 'pending';
  `);

  await knex.schema.alterTable('applications', function(table) {  
    table.string('discord_nickname', 50).notNullable().alter();

    table.text('comment');
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.integer('modified_by');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('applications', function(table) {
    table.dropColumn('status');
    table.dropColumn('comment');
    table.dropColumn('modified_at');
    table.dropColumn('modified_by');

    table.string('discord_nickname', 255).notNullable().alter();
  });

  await knex.raw('DROP TYPE IF EXISTS application_status;');
};
