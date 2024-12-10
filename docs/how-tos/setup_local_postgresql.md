## 1. Setting up Local PostgreSQL instance

Step 1. Install PostgreSQL. Download link: https://www.postgresql.org/download/

<b> Note: if you have an error "psql command not found", then you need to specify it in the environmental PATH (bash_profile)
On bash terminal:
nano ~/.bash_profile
insert this line "export PATH=/Library/PostgreSQL/17/bin:$PATH" (change 17 to your version of PostgreSQL)
save the profile (Ctrl + O)
exit the profile (Ctrl + X)
</b>

Step 2. Access the PostgreSQL interface using the command line:

```bash
psql -U postgres
```

Default password is `admin `

Step 3. Create a new database and a user with credentials and privileges

```sql
CREATE DATABASE mydatabase;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myuser;
```

Step 4. Use `\c mydatabase` to switch context to your database before creating tables.
To verify what datasabe are you in right now, run
`SELECT current_database();`

Step 5. Run SQL scripts (refer to `scripts/db`) directory for database definitions.
Run the scripts in the following order for correct processing:

1. roles
2. user_1
3. user_roles
4. applications
5. privileges

## 2. Set up connection in the app

Step 1. To set up the connection to the database we need to user a driver, PostgreSQL Client. Install package:

```bash
npm install pg
```

Step 2. Create a database config (e.x. `db.js`)

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

Step 3. Add variables to `.env` file

```bash
DB_USER=myuser
DB_PASS=mypassword
DB_NAME=mydatabase
DB_HOST=localhost
DB_PORT=5432
```
