## This is CatBytes Web Platform backend repo.

### API documentation (Swagger)

Located in the `/docs` directory. `*.json` file is used for rendering, `*.yaml` is the original specification used in swagger UI.

Also published on GitHub pages: https://catbytes-community.github.io/webplatform-backend/

### Documentation for developers

Located in the `/docs/how-tos` directory. All important information on local run, deployments, etc is stored there.

### How to run project locally

> ⚠️ For simple local run (no breaking changes) you can connect to the remote (DEV) database. 

To do that, you have to authenticate with AWS CLI first (ref. `/docs/how-tos/local_run_and_configs.md`)

🚨 For proper development it is **strongly recommended** to use local database. Here's how to do that:

1. Follow `/docs/how-tos/setup_local_postgresql`, step "Setting up Local PostgreSQL instance"
2. Use `.env.local` file for environment variables (default `.env` is picked up by Docker so to avoid confusion we use explicit local file for local development). Update your `.env.local` accordingly. Here is sample structure or reach out for up-to-date .env to fellow devs:
```
   DB_USER=marina_kim
   DB_HOST=localhost
   DB_NAME=mydatabase
   DB_PASS=password
   DB_PORT=5432
   ENVIRONMENT=local # the IMPORTANT part!!! this tells the service to use local resources.
```

✅ Once you are authenticated with AWS CLI or you have the local PostgreSQL setup, you can successfully run 

```bash
npm start
``` 
or
```bash
nodemon server.js
```

to start the server.

### Useful commands: Makefile

Refer to the `Makefile` to see commands frequently used in development.
Example usage:

```bash
make connect-dev
```
This will execute the `connect-dev` command and connect you to the dev EC2 instance.
Make sure you have all required environment variables set.

Run 
```bash
make help
```
to list all available Makefile commands.