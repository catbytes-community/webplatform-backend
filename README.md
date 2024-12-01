## This is CatBytes Web Platform backend repo.

### API documentation (Swagger)

Located in the `/docs` directory. `*.json` file is used for rendering, `*.yaml` is the original specification used in swagger UI.

Also published on GitHub pages: https://catbytes-community.github.io/webplatform-backend/

### Documentation for developers

Located in the `/docs/how-tos` directory. All important information on local run, deployments, etc is stored there.

### How to run project locally

1. Follow `/docs/how-tos/aws_local_db_connection` to install AWS CLI and configure AWS credentials, don't have to connect to AWS RDS database from local machine
2. Follow `/docs/how-tos/setup_local_postgresql`, step "Setting up Local PostgreSQL instance"
3. Update your .env accordingly. Here is sample .env structure:
   DB_USER=marina_kim
   DB_HOST=localhost
   DB_NAME=mydatabase
   DB_PASS=password
   DB_PORT=5432
   ENVIRONMENT=local

Once you are authenticated with AWS CLI and you have the local PostgreSQL setup, you should successfully run `npm start` to start the server
