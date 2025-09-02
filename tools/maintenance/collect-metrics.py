#!/usr/bin/env python3
"""
Daily metrics collection script for CosmicHub lint tracking.
Captures current state of lint errors, type issues, and other quality metrics.
"""

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional


def run_command(cmd: str, cwd: Optional[Path] = None) -> tuple[str, int]:
    """Run a shell command and return output and exit code."""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            cwd=cwd,
            timeout=60
        )
        return result.stdout + result.stderr, result.returncode
    except subprocess.TimeoutExpired:
        return "Command timeout", 1
    except Exception as e:
        return f"Command error: {e}", 1


def get_git_info() -> Dict[str, str]:
    """Get current git commit info."""
    output, _ = run_command("git rev-parse HEAD")
    commit_sha = output.strip()
    
    output, _ = run_command("git rev-parse --abbrev-ref HEAD")
    branch_name = output.strip()
    
    return {
        "commit_sha": commit_sha,
        "branch_name": branch_name
    }


def collect_frontend_metrics(project_root: Path) -> Dict[str, Any]:
    """Collect frontend lint and type metrics."""
    metrics = {}
    
    # ESLint errors
    cmd = "pnpm exec eslint apps/astro/src --ext .ts,.tsx --format=json"
    output, exit_code = run_command(cmd, cwd=project_root)
    
    if exit_code == 0:
        try:
            eslint_data = json.loads(output)
            total_errors = sum(len(file_data.get('messages', [])) for file_data in eslint_data)
            metrics['eslint_error_count'] = total_errors
            metrics['eslint_files_with_errors'] = sum(1 for file_data in eslint_data if file_data.get('messages'))
        except json.JSONDecodeError:
            metrics['eslint_error_count'] = 'parse_error'
            metrics['eslint_files_with_errors'] = 'parse_error'
    else:
        # If ESLint fails, try to count from compact format
        cmd = "pnpm exec eslint apps/astro/src --ext .ts,.tsx --format=compact"
        output, _ = run_command(cmd, cwd=project_root)
        error_lines = [line for line in output.split('\n') if ': error' in line or ': warning' in line]
        metrics['eslint_error_count'] = len(error_lines)
        metrics['eslint_files_with_errors'] = 'estimate'
    
    # TypeScript type check
    cmd = "pnpm exec tsc --noEmit"
    output, exit_code = run_command(cmd, cwd=project_root)
    
    if exit_code == 0:
        metrics['typescript_error_count'] = 0
    else:
        # Count TypeScript error lines
        error_lines = [line for line in output.split('\n') if ': error TS' in line]
        metrics['typescript_error_count'] = len(error_lines)
    
    return metrics


def collect_backend_metrics(backend_root: Path) -> Dict[str, Any]:
    """Collect backend lint and type metrics."""
    metrics = {}
    
    # Flake8 critical errors
    critical_codes = "F401,F601,F811,F821,F822,F823,F824,E722"
    cmd = f"python -m flake8 . --select={critical_codes} --format='%(path)s:%(row)d:%(col)d: %(code)s %(text)s'"
    output, _ = run_command(cmd, cwd=backend_root)
    
    critical_errors = [line for line in output.split('\n') if line.strip()]
    metrics['flake8_critical_count'] = len(critical_errors)
    
    # Flake8 total errors
    cmd = "python -m flake8 . --format='%(path)s:%(row)d:%(col)d: %(code)s %(text)s'"
    output, _ = run_command(cmd, cwd=backend_root)
    
    total_errors = [line for line in output.split('\n') if line.strip()]
    metrics['flake8_total_count'] = len(total_errors)
    
    # MyPy errors (if available)
    cmd = "python -m mypy . --ignore-missing-imports --no-strict-optional"
    output, exit_code = run_command(cmd, cwd=backend_root)
    
    if exit_code == 0:
        metrics['mypy_error_count'] = 0
    else:
        # Count MyPy error lines
        error_lines = [line for line in output.split('\n') if ': error:' in line]
        metrics['mypy_error_count'] = len(error_lines)
    
    return metrics


def main():
    """Main metrics collection function."""
    project_root = Path(__file__).parent.parent
    backend_root = project_root / "backend"
    metrics_dir = project_root / "metrics"
    
    # Ensure metrics directory exists
    metrics_dir.mkdir(exist_ok=True)
    
    # Collect all metrics
    timestamp = datetime.utcnow().isoformat() + "Z"
    git_info = get_git_info()
    
    metrics = {
        "timestamp": timestamp,
        "commit_sha": git_info["commit_sha"],
        "branch_name": git_info["branch_name"],
        "collection_method": "local_script"
    }
    
    # Frontend metrics
    print("Collecting frontend metrics...")
    frontend_metrics = collect_frontend_metrics(project_root)
    metrics.update(frontend_metrics)
    
    # Backend metrics
    print("Collecting backend metrics...")
    backend_metrics = collect_backend_metrics(backend_root)
    metrics.update(backend_metrics)
    
    # Save metrics
    date_str = datetime.now().strftime("%Y-%m-%d")
    metrics_file = metrics_dir / f"daily-metrics-{date_str}.json"
    
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print(f"Metrics saved to {metrics_file}")
    print(f"Summary:")
    print(f"  ESLint errors: {metrics.get('eslint_error_count', 'unknown')}")
    print(f"  TypeScript errors: {metrics.get('typescript_error_count', 'unknown')}")
    print(f"  Flake8 critical: {metrics.get('flake8_critical_count', 'unknown')}")
    print(f"  Flake8 total: {metrics.get('flake8_total_count', 'unknown')}")
    print(f"  MyPy errors: {metrics.get('mypy_error_count', 'unknown')}")


if __name__ == "__main__":
    main()
