/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  return knex.transaction(async (trx) => {
    const mentorRole = await trx('roles').where({ role_name: 'mentor' }).first();

    if (!mentorRole) {
      console.warn('Mentor role not found — skipping cleanup.');
      return;
    }

    await trx('user_roles')
      .where('role_id', mentorRole.id)
      .whereIn('user_id', function () {
        this.select('user_id')
          .from('user_roles')
          .where('role_id', mentorRole.id)
          .whereNotIn('user_id', trx('mentors').select('user_id'));
      })
      .del();
  });
};
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(_) {
  // This migration is not reversible because deleted rows cannot be recovered.
  console.warn('⚠️  This migration is not reversible (cannot recover deleted rows)');
};