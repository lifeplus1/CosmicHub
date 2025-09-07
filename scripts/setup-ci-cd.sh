#!/bin/bash

# CI/CD Pipeline Setup Script for CosmicHub
# This script prepares the repository for the enhanced CI/CD pipeline

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running from project root
check_project_root() {
    if [[ ! -f "package.json" ]] || [[ ! -f ".gitlab-ci.yml" ]]; then
        log_error "This script must be run from the CosmicHub project root directory"
        exit 1
    fi
}

# Backup existing CI configuration
backup_existing_config() {
    log_info "Backing up existing CI configuration..."
    
    if [[ -f ".gitlab-ci.yml" ]]; then
        cp .gitlab-ci.yml .gitlab-ci.yml.backup
        log_success "Backed up .gitlab-ci.yml to .gitlab-ci.yml.backup"
    fi
    
    if [[ -f ".github/workflows" ]]; then
        cp -r .github/workflows .github/workflows.backup
        log_success "Backed up GitHub workflows"
    fi
}

# Install required CLI tools
install_cli_tools() {
    log_info "Installing required CLI tools..."
    
    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        log_info "Installing pnpm..."
        npm install -g pnpm@8.15.0
    fi
    
    # Check if markdownlint is available
    if ! npx markdownlint-cli2 --version &> /dev/null; then
        log_info "Installing markdownlint-cli2..."
        pnpm add -D markdownlint-cli2
    fi
    
    log_success "CLI tools installation completed"
}

# Update package.json with missing scripts
update_package_scripts() {
    log_info "Adding missing scripts to package.json..."
    
    # Check if jq is installed for JSON manipulation
    if ! command -v jq &> /dev/null; then
        log_warning "jq not found. Please install jq to automatically update package.json"
        log_info "Manual scripts to add:"
        cat << 'EOF'
{
  "scripts": {
    "test:e2e": "cd apps/astro && playwright test",
    "build:analyze": "cd apps/astro && ANALYZE=1 pnpm run build",
    "audit:prod": "pnpm audit --audit-level moderate --prod",
    "security:scan": "pnpm audit && cd backend && safety check",
    "performance:test": "sitespeed.io --url http://localhost:3000",
    "ci:validate": "pnpm run lint && pnpm run type-check && pnpm run test",
    "ci:build": "pnpm run build:astro && pnpm run build:healwave"
  }
}
EOF
        return
    fi
    
    # Add missing scripts using jq
    jq '.scripts += {
        "test:e2e": "cd apps/astro && playwright test",
        "build:analyze": "cd apps/astro && ANALYZE=1 pnpm run build", 
        "audit:prod": "pnpm audit --audit-level moderate --prod",
        "security:scan": "pnpm audit && cd backend && safety check",
        "performance:test": "sitespeed.io --url http://localhost:3000",
        "ci:validate": "pnpm run lint && pnpm run type-check && pnpm run test",
        "ci:build": "pnpm run build:astro && pnpm run build:healwave"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
    
    log_success "Updated package.json with CI/CD scripts"
}

# Create CI environment configuration
create_ci_env_config() {
    log_info "Creating CI environment configuration..."
    
    # Create .env.ci file
    cat > .env.ci << 'EOF'
# CI Environment Configuration
NODE_ENV=test
LOG_LEVEL=info

# Test Database
REDIS_URL=redis://redis:6379
DATABASE_URL=postgresql://test:test@postgres:5432/test_db

# API Configuration
API_KEY=test-key-for-ci
VITE_BACKEND_URL=http://localhost:8000

# Performance Settings
NODE_OPTIONS=--max-old-space-size=4096
PNPM_CACHE_FOLDER=.pnpm-store
PIP_CACHE_DIR=.pip-cache

# CI Optimizations
GIT_DEPTH=50
CACHE_COMPRESSION_LEVEL=fastest
FF_USE_FASTZIP=true
EOF

    log_success "Created .env.ci configuration file"
}

# Create Docker optimizations
create_docker_optimizations() {
    log_info "Creating Docker optimization files..."
    
    # Create .dockerignore if it doesn't exist
    if [[ ! -f ".dockerignore" ]]; then
        cat > .dockerignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/
.npm/
backend/.venv/
backend/__pycache__/

# Build outputs
dist/
build/
.next/
coverage/

# Logs
*.log
logs/

# Environment files
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# Git
.git/
.gitignore

# CI/CD
.gitlab-ci.yml
.github/

# Documentation
docs/
README.md
*.md

# Tests
**/*.test.*
**/*.spec.*
test-results/
EOF
        log_success "Created .dockerignore file"
    fi
    
    # Create multi-stage Dockerfile for frontend if it doesn't exist
    if [[ ! -f "apps/astro/Dockerfile.optimized" ]]; then
        cat > apps/astro/Dockerfile.optimized << 'EOF'
# Multi-stage build for optimized Astro frontend
FROM node:20-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm@8.15.0
COPY package.json pnpm-lock.yaml ./
COPY apps/astro/package.json ./apps/astro/
RUN pnpm install --frozen-lockfile --prod

FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@8.15.0
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN cd apps/astro && pnpm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/astro/dist /usr/share/nginx/html
COPY apps/astro/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
        log_success "Created optimized Dockerfile for Astro app"
    fi
}

# Create test configuration files
create_test_configs() {
    log_info "Creating test configuration files..."
    
    # Create Jest setup for E2E tests if it doesn't exist
    if [[ ! -f "apps/astro/playwright.config.ts" ]]; then
        cat > apps/astro/playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF
        log_success "Created Playwright configuration"
    fi
}

# Update CI pipeline configuration
update_ci_pipeline() {
    log_info "Updating CI pipeline configuration..."
    
    if [[ -f ".gitlab-ci-improved.yml" ]]; then
        cp .gitlab-ci-improved.yml .gitlab-ci.yml
        log_success "Updated .gitlab-ci.yml with improved configuration"
    else
        log_warning "Improved CI configuration not found. Please ensure .gitlab-ci-improved.yml exists"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing project dependencies..."
    
    # Install root dependencies
    pnpm install
    
    # Install backend dependencies
    if [[ -f "backend/requirements.txt" ]]; then
        cd backend
        if [[ ! -d ".venv" ]]; then
            python3 -m venv .venv
        fi
        source .venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
        pip install safety bandit pytest-cov
        cd ..
    fi
    
    log_success "Dependencies installed successfully"
}

# Validate setup
validate_setup() {
    log_info "Validating CI/CD setup..."
    
    # Check required files
    local required_files=(
        ".gitlab-ci.yml"
        ".sitespeed-budget.json" 
        ".env.ci"
        "vitest.workspace.ts"
        "package.json"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_success "✓ $file exists"
        else
            log_error "✗ $file missing"
        fi
    done
    
    # Check scripts
    if pnpm run --silent ci:validate > /dev/null 2>&1; then
        log_success "✓ CI validation script works"
    else
        log_warning "⚠ CI validation script may need manual verification"
    fi
    
    log_success "Setup validation completed"
}

# Print next steps
print_next_steps() {
    log_info "CI/CD Setup completed! Next steps:"
    echo ""
    echo "1. 🔑 Configure GitLab CI/CD Variables:"
    echo "   - VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID"
    echo "   - RENDER_SERVICE_ID, RENDER_API_KEY"
    echo "   - Firebase configuration variables"
    echo "   - CI_REGISTRY_USER, CI_REGISTRY_PASSWORD"
    echo ""
    echo "2. 🧪 Test the pipeline:"
    echo "   pnpm run ci:validate"
    echo ""
    echo "3. 🚀 Create a test merge request to validate the pipeline"
    echo ""
    echo "4. 📊 Monitor pipeline performance in GitLab CI/CD"
    echo ""
    echo "5. 📖 Review the CI/CD improvements documentation:"
    echo "   docs/CI-CD-IMPROVEMENTS.md"
    echo ""
    log_success "All done! Your enhanced CI/CD pipeline is ready to use."
}

# Main execution
main() {
    log_info "🚀 Setting up enhanced CI/CD pipeline for CosmicHub"
    echo ""
    
    check_project_root
    backup_existing_config
    install_cli_tools
    update_package_scripts
    create_ci_env_config
    create_docker_optimizations
    create_test_configs
    update_ci_pipeline
    install_dependencies
    validate_setup
    print_next_steps
}

# Run main function
main "$@"
