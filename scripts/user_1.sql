CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(255),                  
    email VARCHAR(255) UNIQUE NOT NULL,  
    about TEXT,                        
    languages TEXT[],                  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);
