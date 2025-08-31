# import environment variables
include .env.local
export


lint:
	npx eslint .

test:
	npm test

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

