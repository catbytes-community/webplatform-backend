/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex('users')
      .whereNotNull('email')
      .update({
        email: knex.raw('LOWER(email)')
      });
  
    await knex('users')
      .whereNotNull('discord_nickname')
      .update({
        discord_nickname: knex.raw('LOWER(discord_nickname)')
      });
  
    await knex('applications')
      .whereNotNull('email')
      .update({
        email: knex.raw('LOWER(email)')
      });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function(knex) {
    // No rollback, since original casing is lost
    console.warn('⚠️  This migration is not reversible (original casing lost)');
  };