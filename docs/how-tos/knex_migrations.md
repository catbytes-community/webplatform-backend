# Database migrations with Knex

Migrations documentation: https://knexjs.org/guide/migrations.html

We're using `knex migrate` for database migrations - no manual changes should be performed anymore.

The steps would always be as following:
1. Developing the feature locally, **using local postgresql instance**, all database changes should be stored as migrations in `knex/migrations` folder and tested on a local instance. See **Creating and applying migrations** section below for detais.
2. After the changes are reviewed and approved, the PR is megred into `develop` branch, the migrations should be applied to DEV RDS together with deploying the changes to dev EC2 (see `aws_ec2_deployment.md`)
3. After the changes are merged into `main`, the migrations should be applied to the PROD database together with deployment to PROD EC2.

## Creating and applying migrations

### Creating migrations 

Migrations are stored as `*.js` files in `knex/migrations` folder inside the project. Each migration file contains `exports.up` and `exports.down` functions: the first is used to apply migrations, the second is for rollbacks. 

When you're working on a feature and some database changes need to be performed, for example:
- table schema update
- adding a enum or a custom constraint etc
- making data changes (see `assign_members.js`)

you should create a new migration.<br>
Run this command and give your migration a well-explanatory name:
```bash
knex migrate:make {migration_name}
```
This will generate a new file and you will need to populate it with your changes AND with a rollback query to undo these changes if needed. See existing migrations files to get an idea of how this should work, knex itself also has a good documentation, the link is in the beginning of this document.

**NB~** The agreement is to use `async function` in migrations for consistency, so even though `migrate:make` generates sync methods, please update them.

It is also a good practice to separate migrations by tables or logic rather by "PR" or "task". Try to think how would this be rolled back.

### Applying migrations

After all required migrations are created, you can apply them using:
```
knex migrate:latest
```

This will generate an output requesting you to acknowledge the environment you're applying the changes to. Please be careful and make sure you're running the migrations on the database you actually need.

The default configuration to load is DEVELOPMENT. To run against local setup, your `ENVIRONMENT` env var should be set to `local`.

When running migrations on a prod server, you need to explicitly set the `NODE_ENV=production` in command line before applying migrations.