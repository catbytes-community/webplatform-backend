# Establish connection to AWS RDS and other resources from local run

## Configurations and environments

`node-config` is used for configuration loading.
Configuration files are located in the `/config` directory.
Environment-specific configuration files contain AWS connection info.

to switch between environments, set `NODE_ENV` environment variable. the default value is `development`, so usually you're good to go without any changes, but if you want to connect to PROD resources, you need to set the value explicitly

```bash
export NODE_ENV=production
```

> **NB!!!** Be careful when connecting and making changes to production resources and always make sure you understand what you're doing. Everything should be tested on DEV first.

## Local setup

For security and usability, the service is loading all required secret values from AWS Parameter Store. EC2 automatically has access to it, but to get it to work locally, you will need to do the following:

### Install AWS CLI

For MacOS:
```bash 
$ curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
$ sudo installer -pkg AWSCLIV2.pkg -target /
```

For other OS see documentation: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html 

### Configure AWS credentials

Run in command line:
```bash
aws configure
```

You will be prompted to insert following parameters:

* **AWS Access Key ID:**  Access key ID provided to you in .csv file
* **AWS Secret Access Key:** Access key provided in .csv file
* **Default region:** us-east-1
* **Default output format:** json

After this the service will be able to load secrets from AWS SSM and access database. 

### Connecting to the database via psql

```bash
psql -h catbytes-web-platform-db.ct2ag4a86wsn.eu-west-2.rds.amazonaws.com -U <username> -d postgres -p 5432
```

Change `<username>` to the database admin username provided and insert the password.

