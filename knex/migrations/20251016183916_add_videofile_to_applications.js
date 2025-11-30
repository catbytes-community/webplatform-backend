/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {   
  await knex.schema.alterTable('applications', function(table) {  
    table.string('video_filename', 255);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('applications', function(table) {
    table.dropColumn('video_filename');
  });  
};
  