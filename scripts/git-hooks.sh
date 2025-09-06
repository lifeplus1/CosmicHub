#!/usr/bin/env bash
set -euo pipefail

# CosmicHub Git Hooks Configuration and Best Practices Guide
# This script helps configure and validate the enhanced git hooks system

# Colors for output
readonly RED='\033[0;31m'
readonly YELLOW='\033[1;33m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Helper functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

show_help() {
    echo "CosmicHub Git Hooks Management"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  install     Install and configure all git hooks"
    echo "  validate    Validate current git hooks setup"
    echo "  test        Test git hooks without committing"
    echo "  status      Show current git hooks status"
    echo "  best-practices  Show best practices guide"
    echo "  help        Show this help message"
    echo ""
}

install_hooks() {
    log_info "Installing enhanced CosmicHub git hooks..."
    
    # Ensure hooks directory exists
    mkdir -p .git/hooks
    
    # Check if our enhanced hooks exist
    local hooks=("pre-commit" "pre-push" "commit-msg")
    local missing_hooks=()
    
    for hook in "${hooks[@]}"; do
        if [ ! -f ".git/hooks/$hook" ]; then
            missing_hooks+=("$hook")
        elif [ ! -x ".git/hooks/$hook" ]; then
            chmod +x ".git/hooks/$hook"
            log_info "Made $hook executable"
        fi
    done
    
    if [ ${#missing_hooks[@]} -gt 0 ]; then
        log_error "Missing git hooks: ${missing_hooks[*]}"
        echo "Please ensure the following hooks are installed:"
        for hook in "${missing_hooks[@]}"; do
            echo "  .git/hooks/$hook"
        done
        return 1
    fi
    
    # Validate Husky integration
    if [ -f ".husky/pre-commit" ]; then
        log_success "Husky integration detected"
    else
        log_warning "Husky not detected - manual git hooks only"
    fi
    
    log_success "Git hooks installation verified"
}

validate_setup() {
    log_info "Validating git hooks setup..."
    
    local validation_passed=true
    
    # Check git hooks
    local hooks=("pre-commit" "pre-push" "commit-msg")
    for hook in "${hooks[@]}"; do
        if [ -f ".git/hooks/$hook" ] && [ -x ".git/hooks/$hook" ]; then
            log_success "Git hook $hook is installed and executable"
        else
            log_error "Git hook $hook is missing or not executable"
            validation_passed=false
        fi
    done
    
    # Check required commands
    local commands=("pnpm" "git" "python3")
    for cmd in "${commands[@]}"; do
        if command -v "$cmd" >/dev/null 2>&1; then
            log_success "$cmd is available"
        else
            log_warning "$cmd is not available - some validations will be skipped"
        fi
    done
    
    # Check lint-staged configuration
    if grep -q "lint-staged" package.json; then
        log_success "lint-staged configuration found"
    else
        log_warning "lint-staged configuration not found"
    fi
    
    # Check ESLint configuration
    if [ -f "eslint.config.js" ]; then
        log_success "ESLint configuration found"
    else
        log_warning "ESLint configuration not found"
    fi
    
    # Check TypeScript configuration
    if [ -f "tsconfig.json" ]; then
        log_success "TypeScript configuration found"
    else
        log_warning "TypeScript configuration not found"
    fi
    
    if [ "$validation_passed" = true ]; then
        log_success "Git hooks setup validation passed"
    else
        log_error "Git hooks setup validation failed"
        return 1
    fi
}

test_hooks() {
    log_info "Testing git hooks (dry run)..."
    
    # Test pre-commit hook
    if [ -x ".git/hooks/pre-commit" ]; then
        log_info "Testing pre-commit hook..."
        export COSMICHUB_DRY_RUN=true
        if .git/hooks/pre-commit; then
            log_success "Pre-commit hook test passed"
        else
            log_error "Pre-commit hook test failed"
        fi
        unset COSMICHUB_DRY_RUN
    fi
    
    # Test commit-msg hook
    if [ -x ".git/hooks/commit-msg" ]; then
        log_info "Testing commit-msg hook..."
        echo "feat: test commit message" > /tmp/test-commit-msg
        if .git/hooks/commit-msg /tmp/test-commit-msg; then
            log_success "Commit-msg hook test passed"
        else
            log_error "Commit-msg hook test failed"
        fi
        rm -f /tmp/test-commit-msg
    fi
}

show_status() {
    log_info "Git hooks status:"
    echo ""
    
    # Show enabled hooks
    echo "🔧 Installed Git Hooks:"
    for hook in pre-commit pre-push commit-msg; do
        if [ -f ".git/hooks/$hook" ]; then
            if [ -x ".git/hooks/$hook" ]; then
                echo "  ✅ $hook (executable)"
            else
                echo "  ⚠️  $hook (not executable)"
            fi
        else
            echo "  ❌ $hook (missing)"
        fi
    done
    
    echo ""
    echo "🎯 Current Validation Coverage:"
    echo "  • Documentation freshness and markdown linting"
    echo "  • AI coordination filename validation"
    echo "  • ESLint with zero warnings policy"
    echo "  • TypeScript compilation validation"
    echo "  • Python mypy strict type checking"
    echo "  • Component best practices compliance"
    echo "  • Security and performance checks"
    echo "  • Conventional commit message format"
    echo "  • Build integrity for production branches"
    echo "  • Integration test validation"
    
    echo ""
    echo "🔧 Configuration Options:"
    echo "  • Set COSMICHUB_RUN_TESTS_ON_COMMIT=true for comprehensive testing"
    echo "  • Hooks automatically adapt to available tools (pnpm, python3, etc.)"
    echo "  • Branch-specific validation levels (stricter for main/production)"
}

show_best_practices() {
    log_info "CosmicHub Git Hooks Best Practices Guide"
    echo ""
    
    echo "📋 Commit Best Practices:"
    echo "  • Use conventional commit format: type(scope): description"
    echo "  • Keep first line under 72 characters"
    echo "  • Start description with lowercase"
    echo "  • Avoid ending with punctuation"
    echo ""
    
    echo "🔍 Pre-Commit Validation:"
    echo "  • All TypeScript/JavaScript files pass ESLint with 0 warnings"
    echo "  • TypeScript compilation succeeds without errors"
    echo "  • Python backend passes mypy strict type checking"
    echo "  • No console.log statements in production code"
    echo "  • No hardcoded secrets or API keys"
    echo "  • Large files (>1MB) trigger warnings"
    echo ""
    
    echo "🚀 Pre-Push Validation:"
    echo "  • Production branches require clean builds"
    echo "  • Integration tests must pass"
    echo "  • Security scanning for sensitive files"
    echo "  • Bundle size analysis"
    echo "  • Documentation updates for significant changes"
    echo ""
    
    echo "💡 Performance Tips:"
    echo "  • Use React.memo for pure components"
    echo "  • Implement virtualization for large lists (>100 items)"
    echo "  • Lazy load components and routes"
    echo "  • Use proper error boundaries"
    echo "  • Follow accessibility guidelines (WCAG 2.1 AA)"
    echo ""
    
    echo "🎨 Code Quality Standards:"
    echo "  • Zero ESLint warnings policy"
    echo "  • Strict TypeScript configuration"
    echo "  • Python mypy strict mode"
    echo "  • Consistent code formatting with Prettier"
    echo "  • Component best practices compliance"
    echo ""
    
    echo "🔐 Security Guidelines:"
    echo "  • No hardcoded secrets or API keys"
    echo "  • Use environment variables for configuration"
    echo "  • Regular dependency updates"
    echo "  • Proper error handling without data leaks"
    echo ""
}

# Main command handling
case "${1:-help}" in
    "install")
        install_hooks
        ;;
    "validate")
        validate_setup
        ;;
    "test")
        test_hooks
        ;;
    "status")
        show_status
        ;;
    "best-practices")
        show_best_practices
        ;;
    "help"|*)
        show_help
        ;;
esac
