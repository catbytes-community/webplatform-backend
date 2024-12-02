CREATE TYPE application_status AS ENUM ('approved', 'rejected', 'pending');

CREATE TABLE applications (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    about TEXT NOT NULL,
    video_link VARCHAR(255),
    discord_nickname VARCHAR(255) UNIQUE NOT NULL,
    status application_status DEFAULT 'pending',
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by INTEGER
);