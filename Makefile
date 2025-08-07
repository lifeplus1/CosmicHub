test:
	cd apps/astro && npm run test
	cd apps/healwave && npm run test
	cd backend && pytest

lint:
	npx eslint apps/astro/src apps/healwave/src
	cd backend && flake8 .

build:
	cd apps/astro && npm run build
	cd apps/healwave && npm run build

format:
	npx prettier --write apps/astro/src apps/healwave/src
