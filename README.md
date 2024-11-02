## This is CatBytes Web Platform backend repo.

### API documentation (Swagger)

Located in the /docs directory. `*.json` file is used for rendering, `*.yaml` is the original specification used in swagger UI.

Also published on GitHub pages: https://catbytes-community.github.io/webplatform-backend/

## 1. Setting up Local PostgreSQL instance <br />

<b> Step 1. </b> Install PostgreSQL. Download link: https://www.postgresql.org/download/
<br />
<b> Note: if you have an error "psql command not found", then you need to specify it in the environmental PATH (bash_profile)
On bash terminal:
nano ~/.bash_profile
insert this line "export PATH=/Library/PostgreSQL/17/bin:$PATH" (change 17 to your version of PostgreSQL)
save the profile (Ctrl + O)
exit the profile (Ctrl + X)
</b>

<br />
<b> Step 2.</b> Access the PostgreSQL interface using the command line:<br />
`psql -U postgres`

Default password is `admin `
<br />
<b> Step 3.</b> Create a new database and a user with credentials and privileges
<br />
`CREATE DATABASE mydatabase;`<br />
`CREATE USER myuser WITH PASSWORD 'mypassword';`<br />
`GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;`<br />
`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myuser;`<br />
<b> Step 4.</b> Create a table (ex. "users")<br />
`CREATE TABLE IF NOT EXISTS users ( id SERIAL PRIMARY KEY, username VARCHAR(50) NOT NULL);`<br />

## 2. Set up connection in the app<br />

### (Manual)<br />

<b> Step 1. </b>To set up the connection to the database we need to user a driver, PostgreSQL Client. Install package: <br />
`npm install pg`<br />
<b> Step 2. </b>Create a database config (e.x. `db.js`)<br />

```javascript
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
```

<b> Step 3. </b> Add variables to `.env` file <br /><br />

```
DB_USER=myuser
DB_PASS=mypassword
DB_NAME=mydatabase
DB_HOST=localhost
DB_PORT=5432
```

### (Prisma ORM)<br />

<b> Step 1. </b> Install Prisma CLI and Prisma Client:<br />
`npm install prisma --save-dev`
`npm install @prisma/client`
<br />
<b> Step 2. </b> Initialize Prisma in your project<br />
`npx prisma init`
<br />
<b> Step 3. </b> Update the `.env` file:<br />
`DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"`
<br />

GET requests line: <br />
`curl -X GET http://localhost:8080/users `
<br />
POST requests line:<br />
`curl -X POST http://localhost:8080/users -H "Content-Type: application/json" -d "{\"username\": \"Muffin\"}"`
