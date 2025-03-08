/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.raw(`
    INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, 1
      FROM users u
      ON CONFLICT (user_id, role_id) DO NOTHING;
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // doesn't need a rollback
};
