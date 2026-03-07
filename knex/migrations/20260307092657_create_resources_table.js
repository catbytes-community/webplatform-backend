/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  return knex.schema
    // First create ENUM types if they don't exist
    .raw(`CREATE TYPE resource_type AS ENUM ('post', 'video', 'picture', 'link', 'file');`)
    .raw(`CREATE TYPE resource_audience AS ENUM ('public', 'member', 'mentor');`)
    
    // Then create table using these ENUMs
    .createTable('resources', function(table) {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.specificType('type', 'resource_type').notNullable();
      table.specificType('audience', 'resource_audience').notNullable();
      table.text('description');
      table.string('attachment_filename', 255);
      table.string('link', 500);
      table.integer('created_by').unsigned().references('id').inTable('users');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Base constraint for at least one field
      table.check('?? IS NOT NULL OR ?? IS NOT NULL OR ?? IS NOT NULL', 
        ['description', 'attachment_filename', 'link']);
    })
    .then(() => {
      // Add type-specific constraints
      return knex.raw(`
        ALTER TABLE resources 
        ADD CONSTRAINT resources_type_description_check 
        CHECK (
          (type = 'post' AND description IS NOT NULL) OR 
          (type != 'post')
        );
        
        ALTER TABLE resources 
        ADD CONSTRAINT resources_type_video_check 
        CHECK (
          (type = 'video' AND link IS NOT NULL) OR 
          (type != 'video')
        );
        
        ALTER TABLE resources 
        ADD CONSTRAINT resources_type_picture_check 
        CHECK (
          (type = 'picture' AND (attachment_filename IS NOT NULL OR link IS NOT NULL)) OR 
          (type != 'picture')
        );
        
        ALTER TABLE resources 
        ADD CONSTRAINT resources_type_link_check 
        CHECK (
          (type = 'link' AND link IS NOT NULL) OR 
          (type != 'link')
        );
        
        ALTER TABLE resources 
        ADD CONSTRAINT resources_type_file_check 
        CHECK (
          (type = 'file' AND attachment_filename IS NOT NULL) OR 
          (type != 'file')
        );
      `);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  return knex.schema
    .dropTableIfExists('resources')
    .raw('DROP TYPE IF EXISTS resource_type;')
    .raw('DROP TYPE IF EXISTS resource_audience;');
};