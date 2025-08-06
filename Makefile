# CosmicHub Monorepo Makefile
# Provides common development tasks with error handling and validation

.PHONY: help install test lint build format clean dev docker-build docker-up docker-down health-check setup validate ci-test

# Default target
.DEFAULT_GOAL := help

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)CosmicHub Development Commands$(NC)"
	@echo "=============================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

check-node: ## Check if Node.js is installed
	@command -v node >/dev/null 2>&1 || { echo "$(RED)Error: Node.js is not installed$(NC)" >&2; exit 1; }
	@echo "$(GREEN)✓ Node.js found: $$(node --version)$(NC)"

check-python: ## Check if Python is installed
	@command -v python3 >/dev/null 2>&1 || { echo "$(RED)Error: Python 3 is not installed$(NC)" >&2; exit 1; }
	@echo "$(GREEN)✓ Python found: $$(python3 --version)$(NC)"

install: check-node check-python ## Install all dependencies
	@echo "$(BLUE)Installing root dependencies...$(NC)"
	npm install
	@echo "$(BLUE)Installing frontend/astro dependencies...$(NC)"
	cd frontend/astro && npm install
	@echo "$(BLUE)Installing frontend/healwave dependencies...$(NC)"
	cd frontend/healwave && npm install
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	cd backend && pip3 install -r requirements.txt
	@echo "$(GREEN)✓ All dependencies installed successfully$(NC)"

test: check-node check-python ## Run all tests
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd frontend/astro && npm run test || { echo "$(RED)✗ Astro frontend tests failed$(NC)"; exit 1; }
	cd frontend/healwave && npm run test || { echo "$(RED)✗ Healwave frontend tests failed$(NC)"; exit 1; }
	@echo "$(BLUE)Running backend tests...$(NC)"
	cd backend && python3 -m pytest || { echo "$(RED)✗ Backend tests failed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ All tests passed$(NC)"

lint: check-node ## Run all linters
	@echo "$(BLUE)Linting frontend code...$(NC)"
	npx eslint frontend/astro/src frontend/healwave/src --ext .ts,.tsx || { echo "$(RED)✗ Frontend linting failed$(NC)"; exit 1; }
	@echo "$(BLUE)Linting backend code...$(NC)"
	cd backend && python3 -m flake8 . || { echo "$(RED)✗ Backend linting failed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ All linting passed$(NC)"

build: check-node ## Build all frontend applications
	@echo "$(BLUE)Building frontend/astro...$(NC)"
	cd frontend/astro && npm run build || { echo "$(RED)✗ Astro build failed$(NC)"; exit 1; }
	@echo "$(BLUE)Building frontend/healwave...$(NC)"
	cd frontend/healwave && npm run build || { echo "$(RED)✗ Healwave build failed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ All builds completed successfully$(NC)"

format: check-node ## Format all frontend code
	@echo "$(BLUE)Formatting frontend code...$(NC)"
	npx prettier --write frontend/astro/src frontend/healwave/src --config .prettierrc
	@echo "$(GREEN)✓ Code formatting completed$(NC)"

clean: ## Clean build artifacts and caches
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf frontend/astro/dist
	rm -rf frontend/healwave/dist
	rm -rf backend/__pycache__
	rm -rf backend/api/__pycache__
	rm -rf backend/astro/__pycache__
	rm -rf .pytest_cache
	rm -rf node_modules/.cache
	@echo "$(GREEN)✓ Cleanup completed$(NC)"

dev: check-node ## Start development server for astro frontend
	@echo "$(BLUE)Starting astro development server...$(NC)"
	cd frontend/astro && npm run dev

dev-healwave: check-node ## Start development server for healwave frontend
	@echo "$(BLUE)Starting healwave development server...$(NC)"
	cd frontend/healwave && npm run dev

dev-backend: check-python ## Start backend development server
	@echo "$(BLUE)Starting backend development server...$(NC)"
	cd backend && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

docker-build: ## Build Docker containers
	@echo "$(BLUE)Building Docker containers...$(NC)"
	docker-compose build || { echo "$(RED)✗ Docker build failed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Docker build completed$(NC)"

docker-up: ## Start Docker containers
	@echo "$(BLUE)Starting Docker containers...$(NC)"
	docker-compose up -d || { echo "$(RED)✗ Docker startup failed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Docker containers started$(NC)"

docker-down: ## Stop Docker containers
	@echo "$(BLUE)Stopping Docker containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Docker containers stopped$(NC)"

health-check: ## Check if all services are healthy
	@echo "$(BLUE)Performing health checks...$(NC)"
	@command -v node >/dev/null 2>&1 && echo "$(GREEN)✓ Node.js available$(NC)" || echo "$(RED)✗ Node.js missing$(NC)"
	@command -v python3 >/dev/null 2>&1 && echo "$(GREEN)✓ Python available$(NC)" || echo "$(RED)✗ Python missing$(NC)"
	@command -v docker >/dev/null 2>&1 && echo "$(GREEN)✓ Docker available$(NC)" || echo "$(RED)✗ Docker missing$(NC)"
	@test -f frontend/astro/package.json && echo "$(GREEN)✓ Astro frontend configured$(NC)" || echo "$(RED)✗ Astro frontend missing$(NC)"
	@test -f frontend/healwave/package.json && echo "$(GREEN)✓ Healwave frontend configured$(NC)" || echo "$(RED)✗ Healwave frontend missing$(NC)"
	@test -f backend/requirements.txt && echo "$(GREEN)✓ Backend configured$(NC)" || echo "$(RED)✗ Backend missing$(NC)"

setup: ## Initial project setup
	@echo "$(BLUE)Setting up CosmicHub project...$(NC)"
	@$(MAKE) health-check
	@$(MAKE) install
	@echo "$(GREEN)✓ Project setup completed$(NC)"

validate: ## Validate project structure and dependencies
	@echo "$(BLUE)Validating project structure...$(NC)"
	@test -d frontend/astro/src || { echo "$(RED)✗ Astro frontend src missing$(NC)"; exit 1; }
	@test -d frontend/healwave/src || { echo "$(RED)✗ Healwave frontend src missing$(NC)"; exit 1; }
	@test -d backend/api || { echo "$(RED)✗ Backend API directory missing$(NC)"; exit 1; }
	@test -f .eslintrc.json || { echo "$(RED)✗ ESLint config missing$(NC)"; exit 1; }
	@test -f .prettierrc || { echo "$(RED)✗ Prettier config missing$(NC)"; exit 1; }
	@test -f docker-compose.yml || { echo "$(RED)✗ Docker compose config missing$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Project structure validated$(NC)"

ci-test: ## Run CI/CD pipeline tests locally
	@echo "$(BLUE)Running CI/CD pipeline tests...$(NC)"
	@$(MAKE) validate
	@$(MAKE) lint
	@$(MAKE) test
	@$(MAKE) build
	@echo "$(GREEN)✓ CI/CD pipeline tests completed$(NC)"

type-check: check-node ## Run TypeScript type checking
	@echo "$(BLUE)Running TypeScript type checks...$(NC)"
	cd frontend/astro && npm run type-check || { echo "$(RED)✗ Astro type check failed$(NC)"; exit 1; }
	cd frontend/healwave && npm run type-check || { echo "$(RED)✗ Healwave type check failed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ All type checks passed$(NC)"
