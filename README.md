## 1. Setting up Local PostgreSQL instance 
<b>  Step 1. </b> Install PostgreSQL. Download link: https://www.postgresql.org/download/
   
<b>   Step 2.</b>  Access the PostgreSQL interface using the command line:
   ``` psql -U postgres ```
   Default password is  ```admin ```
<b>  Step 3.</b> Create a new database and a user with credentials and privileges 
``` CREATE DATABASE mydatabase; ```
``` CREATE USER myuser WITH PASSWORD 'mypassword'; ```
``` GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser; ```
<b> Step 4.</b> Create a table (ex. "users")
```CREATE TABLE IF NOT EXISTS users ( id SERIAL PRIMARY KEY, username VARCHAR(50) NOT NULL);```

## 2.  Set up connection in the app
### (Manual)
<b>  Step 1. </b>To set up the connection to the database we need to user a driver, PostgreSQL Client. Install package: 
``` npm install pg ```
<b>  Step 2. </b>Create a database config (e.x. `db.js`)
``` javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,     
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,   
  password: process.env.DB_PASS,  
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
```
<b>  Step 3. </b> Add variables to `.env` file 
``` 
DB_USER=myuser
DB_PASS=mypassword
DB_NAME=mydatabase
DB_HOST=localhost
DB_PORT=5432
```
### (Prisma ORM)
<b>  Step 1. </b> Install Prisma CLI and Prisma Client:
```npm install prisma --save-dev```
```npm install @prisma/client```
<b>  Step 2. </b> Initialize Prisma in your project
```npx prisma init```
<b>  Step 3. </b> Update the `.env` file:
`DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"`



GET requests line: 
```curl -X GET http://localhost:8080/users ```
POST requests line:
```curl -X POST http://localhost:8080/users -H "Content-Type: application/json" -d "{\"username\": \"Muffin\"}"```