# Establish connection to AWS RDS from local run

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