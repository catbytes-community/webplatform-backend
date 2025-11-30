# AWS EC2 Deployment

## General info

This app is deployed on the AWS EC2 Linux VM.<br>
We're using Docker to run the server.

To manage the VM you should sign in to AWS Console either as a root user or as an IAM user with proper access policies.

If you want to connect to the VM from your machine, please use the <webplatform-backend-key-pair.pem> key provided to you.

If you don't have the key, request it from the project team: <strong>marina.kim@catbytes.io</strong>

Here is the terminal command to login/SSH into EC2:
```bash
ssh -i /path/to/your-key.pem ec2-user@<EC2-PUBLIC-IP-OR-DNS>
```

If you have the .pem permission error, run the following command:
```bash
chmod 400 /path/to/your-key.pem
```

## Deploying the changes

We're assuming the changes are already tested locally, reviewed in a PR and are merged into `develop` or `main` branch.

We're using Docker with `docker-compose` to deploy the app.
<br>⚠️ **NB!** 
We have two `docker-compose` files, one per environment. Make sure you use the correct one.

In order to deploy updated app, follow the steps below:
* SSH into AWS EC2
* `cd` into webplatform-backend
* `git pull` the changes (verify you're at the relevant branch first)
* run `npm install` if there are new dependencies
* apply database migrations if needed (see `knex_migrations.md`)
* run this command to stop and remove running instance of the app in docker:
```bash
docker-compose -f docker-compose.{env}.yml down
```
* run server with `node server.js` to verify the changes are applied and everything works as expected
* if everything is ok, stop the server and deploy it using `docker-compose`:
```bash
docker-compose -f docker-compose.{env}.yml up -d --force-recreate 
```
* Verify the server is up and running before leaving :) 

Dev API address: https://devapi.catbytes.io/
PROD API: https://prodapi.catbytes.io/

## Basic Docker commands
* run `docker ps -a` to see all running Docker containers
* `docker logs {container_id}` to see running container's logs
* you might need to re-build using `docker-compose -f docker-compose.{env}.yml build --no-cache` before running `docker-compose up` in case changes were not picked up
