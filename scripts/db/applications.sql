CREATE TABLE applications (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(255),                  
    about TEXT,                                            
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
); 