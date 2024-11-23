CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    is_privileged BOOLEAN
);

-- default roles
INSERT INTO roles (role_name, is_privileged) VALUES ('member', false), ('mentor', true);
