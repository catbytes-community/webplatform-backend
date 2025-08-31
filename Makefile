include .env.local
export

WARN_COLOR := $(shell tput setaf 208)
RESET_COLOR := $(shell tput sgr0)

# Development
lint:
	npx eslint .

test:
	npm test

# EC2 instances connection
connect-dev:
	@if [ -z "$(DEV_PRIVATE_KEY_LOCATION)" ] || [ -z "$(DEV_HOST)" ]; then \
		echo "Error: DEV_PRIVATE_KEY_LOCATION and DEV_HOST environment variables must be set."; \
		exit 1; \
	fi
	ssh -i $(DEV_PRIVATE_KEY_LOCATION) ec2-user@$(DEV_HOST)

connect-prod:
	@if [ -z "$(PROD_PRIVATE_KEY_LOCATION)" ] || [ -z "$(PROD_HOST)" ]; then \
		echo "Error: PROD_PRIVATE_KEY_LOCATION and PROD_HOST environment variables must be set."; \
		exit 1; \
	fi
	ssh -i $(PROD_PRIVATE_KEY_LOCATION) ec2-user@$(PROD_HOST)

# Database migrations with knex
create-migration:
	knex migrate:make $(name)

apply-migrations:
	knex migrate:latest


# EC2 deployment
stop-dev:
	docker-compose -f docker-compose.dev.yml down

stop-prod:
	docker-compose -f docker-compose.prod.yml down	

deploy-env:
	@read -p "$(WARN_COLOR)You're about to deploy to the $(env) environment. Please make sure you pulled recent changes, \
	installed new dependencies and verified the service starts using npm run as well as applied database migrations. \
	Please refer to the /docs/how-tos/aws_ec2_deployment.md for the instructions. \
	If you're sure, press Enter to continue.$(RESET_COLOR)" confirm; \

	docker-compose -f docker-compose.$(env).yml build --no-cache
	docker-compose -f docker-compose.$(env).yml up -d --force-recreate 

deploy-dev:
	@$(MAKE) deploy-env env=dev

deploy-prod:
	@$(MAKE) deploy-env env=prod
