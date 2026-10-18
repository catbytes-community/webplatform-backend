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

# DEV Environment — Shutdown and Restoration (October 2026)

## Overview

The Catbytes DEV environment was shut down on **18 October 2026** to reduce AWS infrastructure costs.

The main resources generating costs were:

- Amazon RDS PostgreSQL
- Amazon ECS Fargate
- Application Load Balancer (ALB)

The infrastructure has been shut down while preserving the Terraform configuration, Docker images and a manual PostgreSQL snapshot to allow future restoration.

**AWS Region:** `eu-west-2` (London)  
**Environment:** `dev`  
**Backend ECS cluster:** `catbytes-backend-dev`  
**API domain:** `devapi.catbytes.io`

## 2. Changes Made During Shutdown

### 2.1 ECS Fargate

Updated the Terraform resource `aws_ecs_service.backend`:

```hcl
desired_count = 0
```

Applied the change using:

```bash
terraform plan
terraform apply
```

This stopped the backend Fargate task while preserving the ECS service, cluster and task definition.

### 2.2 Application Load Balancer

Added a Terraform variable:

```hcl
variable "enable_alb" {
  description = "Whether to deploy the DEV Application Load Balancer"
  type        = bool
  default     = true
}
```

Configured DEV with:

```hcl
enable_alb = false
```

Updated the following resources to be conditional on `var.enable_alb`:

- `aws_lb.backend`
- `aws_lb_target_group.backend`
- `aws_lb_listener.http`
- `aws_lb_listener.https`
- `aws_security_group.alb`
- `aws_vpc_security_group_ingress_rule.ecs_from_alb`
- `aws_route53_record.backend`

Each resource uses:

```hcl
count = var.enable_alb ? 1 : 0
```

Updated references to indexed resources, such as:

```hcl
aws_lb.backend[0].arn
```

Added Terraform `moved` blocks to preserve resource addresses when enabling or disabling the ALB.

Updated the ECS service to attach a load balancer only when enabled:

```hcl
dynamic "load_balancer" {
  for_each = var.enable_alb ? [1] : []

  content {
    target_group_arn = aws_lb_target_group.backend[0].arn
    container_name   = "backend"
    container_port   = 8080
  }
}
```

Terraform plan reviewed before applying:

```text
Plan: 0 to add, 1 to change, 7 to destroy.
```

The change removed the ALB and associated resources while retaining the ECS service.

### 2.3 RDS PostgreSQL

The database was not managed by the backend Terraform state and was deleted through the AWS Console.

Before deletion, a manual snapshot was created.
Snapshot status was confirmed as `Available`.
The manual snapshot must be retained for future restoration.

---

## 3. RDS Configuration Reference

| Setting | Value |
|---|---|
| DB identifier | `catbytes-web-platform-db` |
| Engine | PostgreSQL |
| Engine version | 16.13 |
| Instance class | `db.t4g.micro` |
| Storage | 20 GiB |
| Storage type | gp2 |
| Storage encryption | Enabled |
| KMS key | `aws/rds` |
| Multi-AZ | Disabled |
| Master username | `catbytes_admin` |
| Parameter group | `default.postgres16` |
| Option group | `default:postgres-16` |
| Port | 5432 |
| VPC | `vpc-0a7d613e16d1a2392` |
| DB subnet group | `rds-ec2-db-subnet-group-1` |
| Security group | `sg-07a3345fe3d94d8f0` |
| Availability Zone | `eu-west-2a` |
| Public access | Enabled |
| IAM DB authentication | Disabled |
| Storage autoscaling | Enabled |
| Maximum storage | 1000 GiB |

**Original RDS endpoint:**

```text
catbytes-web-platform-db.ct2ag4a86wsn.eu-west-2.rds.amazonaws.com
```

The restored instance may have a different endpoint. Verify the endpoint before restarting the application.

The original database was publicly accessible. Review whether public access is required when restoring DEV.

---

## 4. Restoring the DEV Environment

Restore the environment in the following order.

### Step 1 — Restore PostgreSQL from the snapshot

It's not terraform managed so work in AWS console.

1. Open AWS Console → RDS → Snapshots → Manual.
2. Select latest snapshot (`backup-before-temp-stop`)
3. Click **Actions → Restore snapshot**.
4. Configure the restored DB instance:
   - DB identifier: `catbytes-web-platform-db`
   - Instance class: `db.t4g.micro`
   - VPC: `vpc-0a7d613e16d1a2392`
   - DB subnet group: `rds-ec2-db-subnet-group-1`
   - Security group: `sg-07a3345fe3d94d8f0`
   - Multi-AZ: Disabled
   - Storage encryption: Enabled

5. Review other settings against the configuration reference above.
6. Start the restoration.
7. Wait until the database status becomes `Available`.

**Important:** Restoring from a snapshot preserves the database contents as of the snapshot, not changes made afterward. Review the restored networking, credentials, storage, backup settings and endpoint.

### Step 2 — Verify database connectivity

Once RDS is available:

1. Copy the restored RDS endpoint.
2. Verify the application database connection configuration.
3. Confirm the PostgreSQL credentials are available through the existing secure configuration or secrets store.
4. Test database connectivity.
5. Confirm the required application database and tables are present.

Do not commit database passwords to Terraform or the repository.

### Step 3 — Restore the Application Load Balancer

Open the DEV Terraform configuration.

In `terraform.tfvars`, change:
`enable_alb = true`

Keep ECS scaled to zero initially:
`desired_count = 0`

Run:
`terraform fmt`
`terraform validate`
`terraform plan`

Review the plan to confirm that Terraform will recreate the expected ALB resources without replacing unrelated infrastructure.

Then run `terraform apply`

Terraform should recreate:

- Application Load Balancer
- HTTP and HTTPS listeners
- Target group
- ALB security group
- ECS ingress rule
- Route 53 record for `devapi.catbytes.io`

The DNS record should automatically reference the newly created ALB.

### Step 4 — Restore ECS Fargate

Once PostgreSQL and the ALB are ready, update the ECS service:
`desired_count = 1`

Run:
`terraform plan`
`terraform apply`

Verify in AWS Console → ECS → Clusters → `catbytes-backend-dev`:

- Desired tasks: 1
- Running tasks: 1
- ECS service deployment successful
- Target group health check passing

The backend container uses port `8080`, and the ALB target group health check uses:
`GET /health`

### Step 5 — Verify the application

Confirm:
- PostgreSQL connectivity works.
- ECS backend task is running.
- ALB target is healthy.
- `devapi.catbytes.io` resolves correctly.
- HTTPS certificate is valid.
- Backend API endpoints respond.
- Application logs show no startup or database connection errors.

The environment should now be operational.

---

## 5. Shutting Down DEV Again

For future shutdowns:

1. Stop application writes and confirm no work is in progress.
2. Set ECS `desired_count = 0`.
3. Run `terraform plan` and `terraform apply`.
4. Set `enable_alb = false`.
5. Run `terraform plan` and `terraform apply`.
6. Take a new manual RDS snapshot and confirm it is available.
7. Delete the RDS instance through AWS Console after checking the backup and configuration.
8. Confirm ECS has zero running tasks, the ALB is deleted and RDS is deleted.

Do not delete the RDS snapshot needed for restoration.

---

## 6. Important Notes

- The RDS snapshot incurs storage charges while retained.
- ECR image storage and CloudWatch logs may continue to generate charges.
- NAT Gateways, public IPv4 addresses and other resources require separate cost review.
- Terraform configuration and state must be preserved.
- Commit the Terraform shutdown changes to version control.
- Do not run `terraform destroy` against the entire DEV environment.
- GitHub Actions deployment workflows may need to be disabled while DEV is shut down to prevent failed deployments or unintended ECS service updates.
- Before restoring, confirm the required ECR image still exists and the RDS snapshot is restorable.
- After restoring, verify application secrets, DNS, database connectivity and health checks.

**Shutdown date:** 18 October 2026  
**Reason:** AWS DEV environment cost optimisation  
**Restoration approach:** Terraform + manual RDS snapshot
