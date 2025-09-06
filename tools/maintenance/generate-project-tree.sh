#!/bin/bash

# CosmicHub Project Tree Generator
# ===============================
# 
# Generates a clean, relevant tree structure of the CosmicHub project
# Filters out noise (node_modules, build artifacts, logs) and focuses on source code

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m' # No Color

# Default configuration
PROJECT_ROOT="${1:-$(pwd)}"
OUTPUT_FILE="${2:-project-structure.md}"
MAX_DEPTH="${3:-4}"
SHOW_HIDDEN="${4:-false}"
INCLUDE_TESTS="${5:-true}"

# Patterns to exclude (directories and files)
EXCLUDE_PATTERNS=(
    "node_modules"
    ".next"
    ".astro"
    "dist"
    "build"
    "coverage"
    "storybook-static"
    ".turbo"
    ".vite"
    "logs"
    "*.log"
    "cache"
    "__pycache__"
    ".pytest_cache"
    ".mypy_cache"
    "*.pyc"
    "*.pyo"
    "*.pyd"
    ".DS_Store"
    "Thumbs.db"
    "*.tmp"
    "*.temp"
    ".env"
    ".env.local"
    ".env.production"
    "*.secrets"
    "analytics*.db"
    "test_analytics*.db"
    "*.tsbuildinfo"
    "tsconfig.tsbuildinfo"
    ".venv"
    "venv"
    ".git"
    ".svn"
    ".hg"
)

# Important file extensions to highlight
IMPORTANT_EXTENSIONS=(
    "ts" "tsx" "js" "jsx" "mjs"
    "py" "pyx" "pyi"
    "astro" "vue" "svelte"
    "json" "yaml" "yml" "toml"
    "md" "mdx"
    "css" "scss" "sass" "less"
    "html" "htm"
    "sh" "bash" "zsh" "fish"
    "sql" "graphql" "gql"
    "Dockerfile" "docker-compose*"
)

# Configuration files to always include
CONFIG_FILES=(
    "package.json"
    "tsconfig*.json"
    "tailwind.config*"
    "vite.config*"
    "astro.config*"
    "vitest.config*"
    "eslint.config*"
    "prettier.config*"
    "postcss.config*"
    "next.config*"
    "nuxt.config*"
    "svelte.config*"
    "rollup.config*"
    "webpack.config*"
    "babel.config*"
    "jest.config*"
    "cypress.config*"
    "playwright.config*"
    "storybook.config*"
    "turbo.json"
    "pnpm-*.yaml"
    "yarn.lock"
    "pnpm-lock.yaml"
    "Cargo.toml"
    "Cargo.lock"
    "pyproject.toml"
    "poetry.lock"
    "requirements*.txt"
    "Pipfile"
    "Pipfile.lock"
    "Dockerfile*"
    "docker-compose*.yml"
    "docker-compose*.yaml"
    ".dockerignore"
    ".gitignore"
    ".gitattributes"
    "README*"
    "LICENSE*"
    "CHANGELOG*"
    "CONTRIBUTING*"
    "Makefile"
    "makefile"
    "firebase.json"
    "vercel.json"
    "netlify.toml"
    ".env.example"
    ".env.template"
)

print_header() {
    echo -e "${BOLD}${BLUE}🌟 CosmicHub Project Structure Generator${NC}"
    echo -e "${CYAN}===============================================${NC}"
    echo ""
    echo -e "${YELLOW}Project Root:${NC} ${PROJECT_ROOT}"
    echo -e "${YELLOW}Output File:${NC} ${OUTPUT_FILE}"
    echo -e "${YELLOW}Max Depth:${NC} ${MAX_DEPTH}"
    echo -e "${YELLOW}Include Tests:${NC} ${INCLUDE_TESTS}"
    echo ""
}

should_exclude() {
    local path="$1"
    local basename
    basename=$(basename "$path")
    
    # Check exclude patterns
    for pattern in "${EXCLUDE_PATTERNS[@]}"; do
        if [[ "$basename" == $pattern ]]; then
            return 0
        fi
    done
    
    # Exclude hidden files unless explicitly requested
    if [[ "$SHOW_HIDDEN" == "false" && "$basename" == .* ]]; then
        # But include important config files
        for config in "${CONFIG_FILES[@]}"; do
            if [[ "$basename" == $config ]]; then
                return 1
            fi
        done
        return 0
    fi
    
    # Exclude test files unless requested
    if [[ "$INCLUDE_TESTS" == "false" ]]; then
        if [[ "$basename" == *test* ]] || [[ "$basename" == *spec* ]] || [[ "$path" == */__tests__/* ]] || [[ "$path" == */tests/* ]]; then
            return 0
        fi
    fi
    
    return 1
}

is_important_file() {
    local file="$1"
    local basename
    local extension
    basename=$(basename "$file")
    extension="${basename##*.}"
    
    # Check if it's a config file
    for config in "${CONFIG_FILES[@]}"; do
        if [[ "$basename" == $config ]]; then
            return 0
        fi
    done
    
    # Check if it has an important extension
    for ext in "${IMPORTANT_EXTENSIONS[@]}"; do
        if [[ "$extension" == "$ext" ]]; then
            return 0
        fi
    done
    
    return 1
}

get_file_icon() {
    local file="$1"
    local basename
    local extension
    basename=$(basename "$file")
    extension="${basename##*.}"
    
    case "$extension" in
        "ts"|"tsx") echo "🔷" ;;
        "js"|"jsx"|"mjs") echo "🟨" ;;
        "py"|"pyx"|"pyi") echo "🐍" ;;
        "astro") echo "🚀" ;;
        "vue") echo "💚" ;;
        "svelte") echo "🧡" ;;
        "html"|"htm") echo "🌐" ;;
        "css"|"scss"|"sass"|"less") echo "🎨" ;;
        "md"|"mdx") echo "📝" ;;
        "json"|"yaml"|"yml"|"toml") echo "⚙️" ;;
        "sh"|"bash"|"zsh"|"fish") echo "🔧" ;;
        "sql") echo "🗄️" ;;
        "graphql"|"gql") echo "📊" ;;
        "Dockerfile") echo "🐳" ;;
        *) 
            case "$basename" in
                "package.json") echo "📦" ;;
                "tsconfig"*) echo "🔧" ;;
                "README"*) echo "📖" ;;
                "LICENSE"*) echo "📄" ;;
                "Makefile"|"makefile") echo "🔨" ;;
                *) echo "📄" ;;
            esac
            ;;
    esac
}

generate_tree_recursive() {
    local dir="$1"
    local prefix="$2"
    local depth="$3"
    local is_last="$4"
    
    if [[ $depth -gt $MAX_DEPTH ]]; then
        return
    fi
    
    local -a items=()
    local -a dirs=()
    local -a files=()
    
    # Read directory contents, excluding unwanted items
    while IFS= read -r -d '' item; do
        local basename
        basename=$(basename "$item")
        
        if should_exclude "$item"; then
            continue
        fi
        
        if [[ -d "$item" ]]; then
            dirs+=("$item")
        elif [[ -f "$item" ]] && is_important_file "$item"; then
            files+=("$item")
        fi
    done < <(find "$dir" -maxdepth 1 -print0 2>/dev/null | sort -z)
    
    # Sort directories and files
    if [[ ${#dirs[@]} -gt 0 ]]; then
        IFS=$'\n' dirs=($(sort <<<"${dirs[*]}"))
    fi
    if [[ ${#files[@]} -gt 0 ]]; then
        IFS=$'\n' files=($(sort <<<"${files[*]}"))
    fi
    
    # Combine directories and files
    if [[ ${#dirs[@]} -gt 0 ]]; then
        for dir_item in "${dirs[@]}"; do
            items+=("$dir_item")
        done
    fi
    if [[ ${#files[@]} -gt 0 ]]; then
        for file_item in "${files[@]}"; do
            items+=("$file_item")
        done
    fi
    
    local total=${#items[@]}
    local current=0
    
    for item in "${items[@]}"; do
        current=$((current + 1))
        local is_last_item=false
        if [[ $current -eq $total ]]; then
            is_last_item=true
        fi
        
        local basename
        basename=$(basename "$item")
        
        local tree_prefix="├── "
        local next_prefix="│   "
        
        if [[ $is_last_item == true ]]; then
            tree_prefix="└── "
            next_prefix="    "
        fi
        
        if [[ -d "$item" ]]; then
            echo "${prefix}${tree_prefix}${basename}/"
            generate_tree_recursive "$item" "${prefix}${next_prefix}" $((depth + 1)) "$is_last_item"
        else
            local icon
            icon=$(get_file_icon "$item")
            echo "${prefix}${tree_prefix}${icon} ${basename}"
        fi
    done
}

generate_summary() {
    local total_dirs=0
    local total_files=0
    local -a file_types=()
    
    echo ""
    echo "## Project Statistics"
    echo ""
    
    # Count directories and files
    while IFS= read -r -d '' item; do
        if should_exclude "$item"; then
            continue
        fi
        
        if [[ -d "$item" ]]; then
            ((total_dirs++))
        elif [[ -f "$item" ]] && is_important_file "$item"; then
            ((total_files++))
            local extension="${item##*.}"
            if [[ "$extension" != "$item" ]]; then
                file_types+=("$extension")
            fi
        fi
    done < <(find "$PROJECT_ROOT" -print0 2>/dev/null)
    
    echo "- **Total Directories:** $total_dirs"
    echo "- **Total Source Files:** $total_files"
    echo ""
    
    # Count file types
    if [[ ${#file_types[@]} -gt 0 ]]; then
        echo "### File Types Distribution"
        echo ""
        printf '%s\n' "${file_types[@]}" | sort | uniq -c | sort -nr | while read -r count ext; do
            echo "- **$ext:** $count files"
        done
        echo ""
    fi
}

generate_key() {
    echo "## Legend"
    echo ""
    echo "### Icons"
    echo "- 🔷 TypeScript files"
    echo "- 🟨 JavaScript files"
    echo "- 🐍 Python files"
    echo "- 🚀 Astro components"
    echo "- 💚 Vue components"
    echo "- 🧡 Svelte components"
    echo "- 🌐 HTML files"
    echo "- 🎨 CSS/Style files"
    echo "- 📝 Markdown files"
    echo "- ⚙️ Configuration files"
    echo "- 🔧 Shell scripts"
    echo "- 🗄️ Database files"
    echo "- 📊 GraphQL files"
    echo "- 🐳 Docker files"
    echo "- 📦 Package configuration"
    echo "- 📖 Documentation"
    echo "- 📄 Other files"
    echo ""
    
    echo "### Excluded Items"
    echo "The following are automatically excluded from the tree:"
    echo "- Build artifacts (dist/, build/, .next/, etc.)"
    echo "- Dependencies (node_modules/, .venv/, etc.)"
    echo "- Temporary files (*.log, cache/, __pycache__/, etc.)"
    echo "- IDE files (.vscode/, .idea/, etc.)"
    echo "- Version control (.git/, .svn/, etc.)"
    if [[ "$INCLUDE_TESTS" == "false" ]]; then
        echo "- Test files (*test*, *spec*, __tests__/, tests/)"
    fi
    if [[ "$SHOW_HIDDEN" == "false" ]]; then
        echo "- Hidden files (except important config files)"
    fi
    echo ""
}

main() {
    print_header
    
    if [[ ! -d "$PROJECT_ROOT" ]]; then
        echo -e "${RED}Error: Project root directory '$PROJECT_ROOT' does not exist${NC}" >&2
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
    
    echo -e "${GREEN}🔍 Analyzing project structure...${NC}"
    
    # Generate the tree structure
    {
        echo "# CosmicHub Project Structure"
        echo ""
        echo "Generated on: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        echo "## Directory Tree"
        echo ""
        echo '```'
        echo "$(basename "$PROJECT_ROOT")/"
        generate_tree_recursive "$PROJECT_ROOT" "" 0 false
        echo '```'
        echo ""
        
        generate_summary
        generate_key
        
    } > "$OUTPUT_FILE"
    
    echo -e "${GREEN}✅ Project tree generated successfully!${NC}"
    echo -e "${YELLOW}📁 Output saved to:${NC} $OUTPUT_FILE"
    echo ""
    echo -e "${CYAN}To view the tree:${NC}"
    echo "   cat $OUTPUT_FILE"
    echo "   less $OUTPUT_FILE"
    echo "   code $OUTPUT_FILE"
    echo ""
    echo -e "${CYAN}To customize generation:${NC}"
    echo "   $0 [project_root] [output_file] [max_depth] [show_hidden] [include_tests]"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo "   $0 . tree.md 3 false false    # Shallow tree, no tests"
    echo "   $0 . tree.md 5 true true      # Deep tree with hidden files and tests"
    echo ""
}

# Show help if requested
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    echo "CosmicHub Project Tree Generator"
    echo ""
    echo "Usage: $0 [project_root] [output_file] [max_depth] [show_hidden] [include_tests]"
    echo ""
    echo "Arguments:"
    echo "  project_root   Directory to analyze (default: current directory)"
    echo "  output_file    Output markdown file (default: project-structure.md)"
    echo "  max_depth      Maximum directory depth (default: 4)"
    echo "  show_hidden    Include hidden files (default: false)"
    echo "  include_tests  Include test files (default: true)"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Basic tree of current directory"
    echo "  $0 . tree.md 3 false false          # Shallow tree, no tests"
    echo "  $0 /path/to/project full-tree.md 6  # Deep tree of specific project"
    echo ""
    exit 0
fi

main "$@"
