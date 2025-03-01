/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,              
        name VARCHAR(255),                  
        email VARCHAR(255) UNIQUE NOT NULL,  
        about TEXT,                        
        languages TEXT[],                  
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
    );

    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) UNIQUE NOT NULL,
        is_privileged BOOLEAN
    );

    -- default roles
    INSERT INTO roles (role_name, is_privileged) VALUES ('Member', false), ('Mentor', true);
    
    CREATE TABLE IF NOT EXISTS user_roles (
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        role_id INT REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
    );

    CREATE TABLE applications (
        id SERIAL PRIMARY KEY, 
        name VARCHAR(255),                  
        about TEXT,                                            
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
    );`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(`
    -- Remove inserted default roles
    DELETE FROM roles WHERE role_name IN ('Member', 'Mentor');

    -- Drop tables in the correct order to prevent foreign key constraint errors
    DROP TABLE IF EXISTS user_roles;
    DROP TABLE IF EXISTS applications;
    DROP TABLE IF EXISTS roles;
    DROP TABLE IF EXISTS users;
  `);
};