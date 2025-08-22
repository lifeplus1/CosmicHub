#!/bin/bash
# Worktree Management Script for CosmicHub
# Safely manages git worktrees for parallel development

set -e

MAIN_REPO="/Users/Chris/Projects/CosmicHub"
USAGE="Usage: $0 {create|cleanup|list|status} [branch-name]"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

list_worktrees() {
    log_info "Current worktrees:"
    cd "$MAIN_REPO"
    git worktree list
}

create_worktree() {
    local branch_name="$1"
    if [[ -z "$branch_name" ]]; then
        log_error "Branch name required for create operation"
        echo "$USAGE"
        exit 1
    fi
    
    local worktree_path="${MAIN_REPO}-${branch_name}"
    
    cd "$MAIN_REPO"
    
    # Check if branch exists
    if git show-ref --verify --quiet "refs/heads/$branch_name"; then
        log_info "Branch '$branch_name' exists, creating worktree..."
    else
        log_info "Creating new branch '$branch_name' and worktree..."
        git checkout -b "$branch_name"
        git checkout main
    fi
    
    # Create worktree
    if [[ -d "$worktree_path" ]]; then
        log_warning "Worktree directory already exists: $worktree_path"
        return 1
    fi
    
    git worktree add "$worktree_path" "$branch_name"
    log_success "Worktree created: $worktree_path"
    log_info "To use: cd $worktree_path"
}

cleanup_worktree() {
    local branch_name="$1"
    if [[ -z "$branch_name" ]]; then
        log_error "Branch name required for cleanup operation"
        echo "$USAGE"
        exit 1
    fi
    
    local worktree_path="${MAIN_REPO}-${branch_name}"
    
    cd "$MAIN_REPO"
    
    # Check if worktree exists
    if ! git worktree list | grep -q "$worktree_path"; then
        log_warning "Worktree not found: $worktree_path"
        return 1
    fi
    
    # Check if branch is merged
    if git merge-base --is-ancestor "$branch_name" main 2>/dev/null; then
        log_info "Branch '$branch_name' appears to be merged into main"
        
        # Remove worktree
        git worktree remove "$worktree_path" --force
        log_success "Worktree removed: $worktree_path"
        
        # Ask about deleting branch
        read -p "Delete branch '$branch_name'? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git branch -d "$branch_name" 2>/dev/null || git branch -D "$branch_name"
            log_success "Branch '$branch_name' deleted"
        else
            log_info "Branch '$branch_name' kept"
        fi
    else
        log_warning "Branch '$branch_name' may not be merged into main"
        log_warning "Use 'git worktree remove $worktree_path --force' manually if needed"
    fi
}

show_status() {
    cd "$MAIN_REPO"
    log_info "Repository status:"
    echo "Current branch: $(git branch --show-current)"
    echo "Last commit: $(git log --oneline -1)"
    echo ""
    list_worktrees
}

case "${1:-}" in
    create)
        create_worktree "$2"
        ;;
    cleanup)
        cleanup_worktree "$2"
        ;;
    list)
        list_worktrees
        ;;
    status)
        show_status
        ;;
    *)
        echo "$USAGE"
        echo ""
        echo "Commands:"
        echo "  create <branch>  - Create worktree for branch"
        echo "  cleanup <branch> - Clean up worktree for branch"  
        echo "  list            - List all worktrees"
        echo "  status          - Show repository and worktree status"
        exit 1
        ;;
esac
