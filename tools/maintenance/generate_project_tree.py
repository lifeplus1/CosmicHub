#!/usr/bin/env python3
"""
CosmicHub Project Tree Generator
===============================

Generates a clean, relevant tree structure of the CosmicHub project.
Filters out noise (node_modules, build artifacts, logs) and focuses on source code.
"""

import os
import sys
import argparse
from pathlib import Path
from typing import List, Set, Dict
from datetime import datetime
import fnmatch

# Configuration
EXCLUDE_PATTERNS = {
    "node_modules", ".next", ".astro", "dist", "build", "coverage", 
    "storybook-static", ".turbo", ".vite", "logs", "cache", "__pycache__",
    ".pytest_cache", ".mypy_cache", ".DS_Store", "Thumbs.db", "*.tmp",
    "*.temp", ".env", ".env.local", ".env.production", "*.secrets",
    "analytics*.db", "test_analytics*.db", "*.tsbuildinfo", "tsconfig.tsbuildinfo",
    ".venv", "venv", ".git", ".svn", ".hg", "*.log", "*.pyc", "*.pyo", "*.pyd"
}

IMPORTANT_EXTENSIONS = {
    "ts", "tsx", "js", "jsx", "mjs", "py", "pyx", "pyi", "astro", "vue", 
    "svelte", "json", "yaml", "yml", "toml", "md", "mdx", "css", "scss", 
    "sass", "less", "html", "htm", "sh", "bash", "zsh", "fish", "sql", 
    "graphql", "gql"
}

CONFIG_FILES = {
    "package.json", "tsconfig*.json", "tailwind.config*", "vite.config*",
    "astro.config*", "vitest.config*", "eslint.config*", "prettier.config*",
    "postcss.config*", "turbo.json", "pnpm-*.yaml", "yarn.lock", "pnpm-lock.yaml",
    "Cargo.toml", "Cargo.lock", "pyproject.toml", "poetry.lock", "requirements*.txt",
    "Pipfile", "Pipfile.lock", "Dockerfile*", "docker-compose*.yml", 
    "docker-compose*.yaml", ".dockerignore", ".gitignore", ".gitattributes",
    "README*", "LICENSE*", "CHANGELOG*", "CONTRIBUTING*", "Makefile", "makefile",
    "firebase.json", "vercel.json", "netlify.toml", ".env.example", ".env.template"
}

FILE_ICONS = {
    "ts": "🔷", "tsx": "🔷", "js": "🟨", "jsx": "🟨", "mjs": "🟨",
    "py": "🐍", "pyx": "🐍", "pyi": "🐍", "astro": "🚀", "vue": "💚",
    "svelte": "🧡", "html": "🌐", "htm": "🌐", "css": "🎨", "scss": "🎨",
    "sass": "🎨", "less": "🎨", "md": "📝", "mdx": "📝", "json": "⚙️",
    "yaml": "⚙️", "yml": "⚙️", "toml": "⚙️", "sh": "🔧", "bash": "🔧",
    "zsh": "🔧", "fish": "🔧", "sql": "🗄️", "graphql": "📊", "gql": "📊"
}

SPECIAL_FILES = {
    "package.json": "📦", "Dockerfile": "🐳", "README": "📖", 
    "LICENSE": "📄", "Makefile": "🔨", "makefile": "🔨"
}

def should_exclude(path: Path, include_tests: bool = True, show_hidden: bool = False) -> bool:
    """Check if a path should be excluded from the tree."""
    name = path.name
    
    # Check exclude patterns
    for pattern in EXCLUDE_PATTERNS:
        if fnmatch.fnmatch(name, pattern):
            return True
    
    # Handle hidden files
    if not show_hidden and name.startswith('.'):
        # But include important config files
        for config_pattern in CONFIG_FILES:
            if fnmatch.fnmatch(name, config_pattern):
                return False
        return True
    
    # Handle test files
    if not include_tests:
        if any(test_word in name.lower() for test_word in ['test', 'spec']) or \
           any(test_dir in str(path).lower() for test_dir in ['__tests__', 'tests']):
            return True
    
    return False

def is_important_file(path: Path) -> bool:
    """Check if a file should be included in the tree."""
    name = path.name
    
    # Check config files
    for config_pattern in CONFIG_FILES:
        if fnmatch.fnmatch(name, config_pattern):
            return True
    
    # Check extensions
    if path.suffix:
        ext = path.suffix[1:]  # Remove the dot
        if ext in IMPORTANT_EXTENSIONS:
            return True
    
    return False

def get_file_icon(path: Path) -> str:
    """Get an icon for a file based on its type."""
    name = path.name
    
    # Check special files first
    for special_name, icon in SPECIAL_FILES.items():
        if special_name.lower() in name.lower():
            return icon
    
    # Check by extension
    if path.suffix:
        ext = path.suffix[1:]  # Remove the dot
        return FILE_ICONS.get(ext, "📄")
    
    return "📄"

def generate_tree(root_path: Path, max_depth: int = 4, include_tests: bool = True, 
                 show_hidden: bool = False) -> List[str]:
    """Generate the tree structure as a list of strings."""
    lines = []
    
    def _generate_recursive(path: Path, prefix: str = "", depth: int = 0, is_last: bool = True):
        if depth > max_depth:
            return
        
        if should_exclude(path, include_tests, show_hidden):
            return
        
        # Get items in directory
        try:
            items = []
            if path.is_dir():
                for item in sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name.lower())):
                    if not should_exclude(item, include_tests, show_hidden):
                        if item.is_dir() or is_important_file(item):
                            items.append(item)
        except PermissionError:
            return
        
        # Generate tree for items
        for i, item in enumerate(items):
            is_last_item = i == len(items) - 1
            
            if item.is_dir():
                connector = "└── " if is_last_item else "├── "
                lines.append(f"{prefix}{connector}{item.name}/")
                
                next_prefix = prefix + ("    " if is_last_item else "│   ")
                _generate_recursive(item, next_prefix, depth + 1, is_last_item)
            else:
                connector = "└── " if is_last_item else "├── "
                icon = get_file_icon(item)
                lines.append(f"{prefix}{connector}{icon} {item.name}")
    
    # Start with root
    lines.append(f"{root_path.name}/")
    _generate_recursive(root_path, "", 0, True)
    
    return lines

def generate_statistics(root_path: Path, include_tests: bool = True, 
                       show_hidden: bool = False) -> Dict:
    """Generate project statistics."""
    stats = {
        "total_dirs": 0,
        "total_files": 0,
        "file_types": {}
    }
    
    def _count_recursive(path: Path):
        if should_exclude(path, include_tests, show_hidden):
            return
        
        try:
            if path.is_dir():
                stats["total_dirs"] += 1
                for item in path.iterdir():
                    _count_recursive(item)
            elif path.is_file() and is_important_file(path):
                stats["total_files"] += 1
                if path.suffix:
                    ext = path.suffix[1:]
                    stats["file_types"][ext] = stats["file_types"].get(ext, 0) + 1
        except PermissionError:
            pass
    
    _count_recursive(root_path)
    return stats

def main():
    parser = argparse.ArgumentParser(description="Generate CosmicHub project tree structure")
    parser.add_argument("project_root", nargs="?", default=".", 
                       help="Project root directory (default: current directory)")
    parser.add_argument("-o", "--output", default="project-structure.md",
                       help="Output file (default: project-structure.md)")
    parser.add_argument("-d", "--max-depth", type=int, default=4,
                       help="Maximum directory depth (default: 4)")
    parser.add_argument("--include-tests", action="store_true", default=True,
                       help="Include test files (default: True)")
    parser.add_argument("--no-tests", action="store_true",
                       help="Exclude test files")
    parser.add_argument("--show-hidden", action="store_true",
                       help="Include hidden files")
    
    args = parser.parse_args()
    
    # Handle test inclusion
    include_tests = args.include_tests and not args.no_tests
    
    root_path = Path(args.project_root).resolve()
    
    if not root_path.exists():
        print(f"❌ Error: Path '{root_path}' does not exist", file=sys.stderr)
        sys.exit(1)
    
    if not root_path.is_dir():
        print(f"❌ Error: Path '{root_path}' is not a directory", file=sys.stderr)
        sys.exit(1)
    
    print("🌟 CosmicHub Project Structure Generator")
    print("=" * 45)
    print(f"📁 Project Root: {root_path}")
    print(f"📄 Output File: {args.output}")
    print(f"📊 Max Depth: {args.max_depth}")
    print(f"🧪 Include Tests: {include_tests}")
    print(f"👁️ Show Hidden: {args.show_hidden}")
    print()
    
    print("🔍 Analyzing project structure...")
    
    # Generate tree
    tree_lines = generate_tree(root_path, args.max_depth, include_tests, args.show_hidden)
    
    # Generate statistics
    stats = generate_statistics(root_path, include_tests, args.show_hidden)
    
    # Write output
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write("# CosmicHub Project Structure\n\n")
        f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("## Directory Tree\n\n")
        f.write("```\n")
        for line in tree_lines:
            f.write(line + "\n")
        f.write("```\n\n")
        
        # Statistics
        f.write("## Project Statistics\n\n")
        f.write(f"- **Total Directories:** {stats['total_dirs']}\n")
        f.write(f"- **Total Source Files:** {stats['total_files']}\n\n")
        
        if stats['file_types']:
            f.write("### File Types Distribution\n\n")
            for ext, count in sorted(stats['file_types'].items(), key=lambda x: x[1], reverse=True):
                f.write(f"- **{ext}:** {count} files\n")
            f.write("\n")
        
        # Legend
        f.write("## Legend\n\n")
        f.write("### Icons\n")
        f.write("- 🔷 TypeScript files\n")
        f.write("- 🟨 JavaScript files\n")
        f.write("- 🐍 Python files\n")
        f.write("- 🚀 Astro components\n")
        f.write("- 💚 Vue components\n")
        f.write("- 🧡 Svelte components\n")
        f.write("- 🌐 HTML files\n")
        f.write("- 🎨 CSS/Style files\n")
        f.write("- 📝 Markdown files\n")
        f.write("- ⚙️ Configuration files\n")
        f.write("- 🔧 Shell scripts\n")
        f.write("- 🗄️ Database files\n")
        f.write("- 📊 GraphQL files\n")
        f.write("- 🐳 Docker files\n")
        f.write("- 📦 Package configuration\n")
        f.write("- 📖 Documentation\n")
        f.write("- 📄 Other files\n\n")
        
        f.write("### Excluded Items\n")
        f.write("The following are automatically excluded from the tree:\n")
        f.write("- Build artifacts (dist/, build/, .next/, etc.)\n")
        f.write("- Dependencies (node_modules/, .venv/, etc.)\n")
        f.write("- Temporary files (*.log, cache/, __pycache__/, etc.)\n")
        f.write("- IDE files (.vscode/, .idea/, etc.)\n")
        f.write("- Version control (.git/, .svn/, etc.)\n")
        if not include_tests:
            f.write("- Test files (*test*, *spec*, __tests__/, tests/)\n")
        if not args.show_hidden:
            f.write("- Hidden files (except important config files)\n")
        f.write("\n")
    
    print("✅ Project tree generated successfully!")
    print(f"📁 Output saved to: {args.output}")
    print()
    print("📖 To view the tree:")
    print(f"   cat {args.output}")
    print(f"   less {args.output}")
    print(f"   code {args.output}")
    print()
    print("🔧 To customize generation:")
    print(f"   {sys.argv[0]} --help")

if __name__ == "__main__":
    main()
