test:
	cd frontend/astro && npm run test
	cd frontend/healwave && npm run test
	cd backend && pytest

lint:
	npx eslint frontend/astro/src frontend/healwave/src
	cd backend && flake8 .

build:
	cd frontend/astro && npm run build
	cd frontend/healwave && npm run build

format:
	npx prettier --write frontend/astro/src frontend/healwave/src
