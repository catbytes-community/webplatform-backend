CREATE TABLE applications (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    about TEXT,                                            
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
); 