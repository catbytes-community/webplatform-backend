CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100) NOT NULL,         
    email VARCHAR(100) UNIQUE NOT NULL, 
    discord_nickname VARCHAR(50) UNIQUE NOT NULL,
    img VARCHAR(255), 
    about TEXT,                        
    languages TEXT[],               
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    firebase_id VARCHAR(255)
    CONSTRAINT chk_not_empty_name CHECK (name <> '')
);
