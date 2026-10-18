/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.raw(`
    ALTER TABLE tags_assigned 
    DROP CONSTRAINT IF EXISTS tags_assigned_assigned_to_check;
    
    ALTER TABLE tags_assigned 
    ADD CONSTRAINT tags_assigned_assigned_to_check 
    CHECK (assigned_to IN ('mentor', 'project', 'study_buddy', 'resource'));
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.raw(`
    ALTER TABLE tags_assigned 
    DROP CONSTRAINT IF EXISTS tags_assigned_assigned_to_check;
    
    ALTER TABLE tags_assigned 
    ADD CONSTRAINT tags_assigned_assigned_to_check 
    CHECK (assigned_to IN ('mentor', 'project', 'study_buddy'));
  `);
};