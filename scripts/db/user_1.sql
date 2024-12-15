CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100),                  
    email VARCHAR(100) UNIQUE NOT NULL, 
    img VARCHAR(255), 
    about TEXT,                        
    languages TEXT[],               
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    firebase_id VARCHAR(255)
);
