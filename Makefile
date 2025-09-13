include .env.local
export

# To make sure these targets are not confused with files of the same name
.PHONY: help lint test clean deploy-dev deploy-prod stop-dev stop-prod \
        connect-dev connect-prod create-migration apply-migrations rollback-migration

WARN_COLOR := $(shell tput setaf 208)
GREEN_COLOR := $(shell tput setaf 2)
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

rollback-migration:
	knex migrate:rollback


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

help:
	@echo ""
	@echo "🛠  $(GREEN_COLOR)Makefile Help$(RESET_COLOR)"
	@echo ""
	@echo "🔧 Development:"
	@echo "  $(GREEN_COLOR)lint$(RESET_COLOR)              Run eslint to check code quality"
	@echo "  $(GREEN_COLOR)test$(RESET_COLOR)              Run unit tests with npm"

	@echo ""
	@echo "🌐 EC2 Instances:"
	@echo "  $(GREEN_COLOR)connect-dev$(RESET_COLOR)       SSH into the dev EC2 instance"
	@echo "  $(GREEN_COLOR)connect-prod$(RESET_COLOR)      SSH into the prod EC2 instance"

	@echo ""
	@echo "🛢  Database Migrations (Knex):"
	@echo "  $(GREEN_COLOR)create-migration$(RESET_COLOR)  Create a new migration (usage: make create-migration name=xyz)"
	@echo "  $(GREEN_COLOR)apply-migrations$(RESET_COLOR)  Apply the latest migrations"
	@echo "  $(GREEN_COLOR)rollback-migration$(RESET_COLOR)Rollback the last migration"

	@echo ""
	@echo "🚀 Deployment:"
	@echo "  $(GREEN_COLOR)deploy-dev$(RESET_COLOR)        Deploy the dev environment"
	@echo "  $(GREEN_COLOR)deploy-prod$(RESET_COLOR)       Deploy the prod environment"
	@echo "  $(GREEN_COLOR)stop-dev$(RESET_COLOR)          Stop the dev Docker Compose"
	@echo "  $(GREEN_COLOR)stop-prod$(RESET_COLOR)         Stop the prod Docker Compose"