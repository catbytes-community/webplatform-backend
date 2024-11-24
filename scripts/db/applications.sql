CREATE TABLE applications (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    about TEXT NOT NULL,
    video_link VARCHAR(255),
    discord_nickname VARCHAR(255) UNIQUE NOT NULL,                                           
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
); 