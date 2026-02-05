.PHONY: launch-prod launch-dev frontend stop-dev stop-prod

launch-prod:
	$(MAKE) stop-prod
	$(MAKE) stop-dev
	docker compose -f docker-compose.prod.yml up -d --build

launch-dev:
	$(MAKE) stop-prod
	$(MAKE) stop-dev
	docker compose -f docker-compose.dev.yml up -d --build
	$(MAKE) frontend

frontend:
	cd ./frontend && ng serve

stop-dev:
	docker compose -f docker-compose.dev.yml down

stop-prod:
	docker compose -f docker-compose.prod.yml down

logs-prod:
	docker compose -f docker-compose.prod.yml logs -f -n 50

logs-dev:
	docker compose -f docker-compose.dev.yml logs -f -n 50
