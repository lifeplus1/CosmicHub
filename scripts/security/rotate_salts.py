#!/usr/bin/env python3
"""
Automated salt rotation script for pseudonymization.

This script checks for salts that are due for rotation and performs
batch rotation with proper logging and error handling.

Usage:
    python rotate_salts.py [--dry-run] [--force] [--user-id USER_ID] [--global-type TYPE]

Options:
    --dry-run       Show what would be rotated without making changes
    --force         Force rotation regardless of schedule
    --user-id       Rotate salt for specific user only
    --global-type   Rotate specific global salt type only
    --verbose       Enable verbose logging
"""
import argparse
import asyncio
import logging
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List, Union, TypedDict

# Define type aliases for clarity
ByteString = bytes
UserID = str
SaltType = str

# Type definitions for better static analysis
class RotationResult(TypedDict, total=False):
    """Type definition for rotation result dictionaries."""
    user_id: str
    salt_type: str
    action: str
    old_salt_exists: bool
    new_salt_length: int
    error: str
    timestamp: str
    
class BatchRotationResult(TypedDict, total=False):
    """Type definition for batch rotation result dictionaries."""
    action: str
    users_due: int
    globals_due: int
    user_ids: List[str]
    global_types: List[str]
    duration_seconds: float
    results: Dict[str, Any]
    error: str
    timestamp: str

# Create a unified type for all rotation results
RotationResponse = Union[RotationResult, BatchRotationResult]

# For type hinting with dynamic imports
class SaltStorage:
    """Type stub for SaltStorage class."""
    
    def get_user_salt(self, user_id: str) -> Optional[ByteString]: ...
    def create_user_salt(self, user_id: str) -> ByteString: ...
    def rotate_user_salt(self, user_id: str) -> ByteString: ...
    def get_global_salt(self, salt_type: str) -> Optional[ByteString]: ...
    def create_global_salt(self, salt_type: str) -> ByteString: ...
    def get_salts_due_for_rotation(self) -> Dict[str, List[str]]: ...
    async def batch_rotate_salts(
        self, user_ids: List[str], global_types: List[str]
    ) -> Dict[str, Any]: ...

# Add the backend directory to the Python path
script_dir = Path(__file__).parent
backend_dir = script_dir.parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

try:
    # Import with type ignore as the path is dynamically added at runtime
    from utils.salt_storage import SaltStorage, get_salt_storage  # type: ignore
except ImportError as e:
    print(f"Error importing salt storage modules: {e}")
    print(f"Make sure you're running this script from the correct directory")
    print(f"Expected backend directory: {backend_dir}")
    sys.exit(1)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/salt_rotation.log') if Path('logs').exists() else logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def setup_logging(verbose: bool = False) -> None:
    """Setup logging configuration."""
    level = logging.DEBUG if verbose else logging.INFO
    logger.setLevel(level)
    
    # Create logs directory if it doesn't exist
    logs_dir = Path("logs")
    if not logs_dir.exists():
        logs_dir.mkdir(exist_ok=True)
    
    # Add file handler for salt rotation logs
    log_file = logs_dir / "salt_rotation.log"
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(level)
    file_handler.setFormatter(
        logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    )
    logger.addHandler(file_handler)


async def rotate_specific_user(storage: SaltStorage, user_id: str, dry_run: bool = False) -> RotationResult:  # type: ignore
    """Rotate salt for a specific user."""
    logger.info(f"Rotating salt for user: {user_id}")
    
    if dry_run:
        logger.info("DRY RUN: Would rotate salt for user %s", user_id)
        return {
            'user_id': user_id,
            'action': 'would_rotate',
            'timestamp': datetime.now().isoformat()
        }
    
    try:
        old_salt = storage.get_user_salt(user_id)  # type: ignore
        if not old_salt:
            logger.warning(f"No existing salt found for user {user_id}, creating new one")
            new_salt = storage.create_user_salt(user_id)  # type: ignore
            action = 'created'
        else:
            new_salt = storage.rotate_user_salt(user_id)  # type: ignore
            action = 'rotated'
        
        result: RotationResult = {
            'user_id': user_id,
            'action': action,
            'old_salt_exists': old_salt is not None,
            'new_salt_length': len(new_salt),  # type: ignore
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Successfully {action} salt for user {user_id}")
        return result
        
    except Exception as e:
        logger.error(f"Error rotating salt for user {user_id}: {e}")
        return {
            'user_id': user_id,
            'action': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }


async def rotate_specific_global(storage: SaltStorage, salt_type: str, dry_run: bool = False) -> RotationResult:  # type: ignore
    """Rotate a specific global salt."""
    logger.info(f"Rotating global salt: {salt_type}")
    
    if dry_run:
        logger.info("DRY RUN: Would rotate global salt %s", salt_type)
        return {
            'salt_type': salt_type,
            'action': 'would_rotate',
            'timestamp': datetime.now().isoformat()
        }
    
    try:
        old_salt = storage.get_global_salt(salt_type)  # type: ignore
        if not old_salt:
            logger.warning(f"No existing global salt found for type {salt_type}, creating new one")
            new_salt = storage.create_global_salt(salt_type)  # type: ignore
            action = 'created'
        else:
            new_salt = storage.create_global_salt(salt_type)  # type: ignore  # This replaces the old one
            action = 'rotated'
        
        result: RotationResult = {
            'salt_type': salt_type,
            'action': action,
            'old_salt_exists': old_salt is not None,
            'new_salt_length': len(new_salt),  # type: ignore
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Successfully {action} global salt for type {salt_type}")
        return result
        
    except Exception as e:
        logger.error(f"Error rotating global salt {salt_type}: {e}")
        return {
            'salt_type': salt_type,
            'action': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }


async def rotate_due_salts(storage: SaltStorage, force: bool = False, dry_run: bool = False) -> BatchRotationResult:  # type: ignore
    """Rotate all salts that are due for rotation."""
    logger.info("Checking for salts due for rotation...")
    
    # Get salts due for rotation
    due_salts = storage.get_salts_due_for_rotation()  # type: ignore
    
    if force:
        logger.info("Force mode enabled - will rotate all found salts regardless of schedule")
    
    total_users = len(due_salts['users'])  # type: ignore
    total_globals = len(due_salts['globals'])  # type: ignore
    
    logger.info(f"Found {total_users} user salts and {total_globals} global salts due for rotation")
    
    if total_users == 0 and total_globals == 0:
        if not force:
            logger.info("No salts are due for rotation")
            return {
                'action': 'no_rotation_needed',
                'users_due': 0,
                'globals_due': 0,
                'timestamp': datetime.now().isoformat()
            }
    
    if dry_run:
        logger.info("DRY RUN: Would rotate %d users and %d globals", total_users, total_globals)
        return {
            'action': 'dry_run',
            'users_due': total_users,
            'globals_due': total_globals,
            'user_ids': due_salts['users'],
            'global_types': due_salts['globals'],
            'timestamp': datetime.now().isoformat()
        }
    
    # Perform batch rotation
    logger.info("Starting batch rotation...")
    start_time = datetime.now()
    
    try:
        results = await storage.batch_rotate_salts(due_salts['users'], due_salts['globals'])  # type: ignore
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        logger.info(f"Batch rotation completed in {duration:.2f} seconds")
        logger.info(f"Results: {results['users_rotated']} users, {results['globals_rotated']} globals")
        
        if results['errors']:
            logger.warning(f"Encountered {len(results['errors'])} errors during rotation:")  # type: ignore
            for error in results['errors']:  # type: ignore
                logger.warning(f"  - {error}")
        
        return {
            'action': 'batch_rotation_complete',
            'duration_seconds': duration,
            'results': results,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error during batch rotation: {e}")
        return {
            'action': 'batch_rotation_error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }


async def main() -> None:
    """Main script execution."""
    parser = argparse.ArgumentParser(description='Rotate pseudonymization salts')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Show what would be rotated without making changes')
    parser.add_argument('--force', action='store_true',
                       help='Force rotation regardless of schedule')
    parser.add_argument('--user-id', type=str,
                       help='Rotate salt for specific user only')
    parser.add_argument('--global-type', type=str,
                       help='Rotate specific global salt type only')
    parser.add_argument('--verbose', action='store_true',
                       help='Enable verbose logging')
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging(args.verbose)
    
    logger.info("Starting salt rotation script")
    logger.info(f"Arguments: {args}")
    
    try:
        # Initialize salt storage
        storage = get_salt_storage()  # type: ignore
        
        # Determine what action to take
        result: RotationResponse
        if args.user_id:
            result = await rotate_specific_user(storage, args.user_id, args.dry_run)  # type: ignore
        elif args.global_type:
            result = await rotate_specific_global(storage, args.global_type, args.dry_run)  # type: ignore
        else:
            result = await rotate_due_salts(storage, args.force, args.dry_run)  # type: ignore
        
        # Output results
        logger.info("Salt rotation completed")
        
        # Save results to file for audit trail
        results_dir = Path("logs")
        results_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = results_dir / f"salt_rotation_results_{timestamp}.json"
        
        with open(results_file, 'w') as f:
            json.dump(result, f, indent=2, default=str)
        
        logger.info(f"Results saved to {results_file}")
        
        # Print summary to stdout
        if args.user_id or args.global_type:
            print(f"Individual rotation result: {result.get('action', 'unknown')}")  # type: ignore
        else:
            action = result.get('action', 'unknown')  # type: ignore
            if action == 'no_rotation_needed':
                print("No salts were due for rotation")
            elif action == 'dry_run':
                # Safe access pattern with get() and default values
                users_due = result.get('users_due', 0)  # type: ignore
                globals_due = result.get('globals_due', 0)  # type: ignore
                print(f"DRY RUN: Would rotate {users_due} users and {globals_due} globals")
            elif action == 'batch_rotation_complete':
                # Safe access with defensive coding
                batch_results = result.get('results', {})  # type: ignore
                if batch_results:
                    users_rotated = batch_results.get('users_rotated', 0)
                    globals_rotated = batch_results.get('globals_rotated', 0)
                    print(f"Batch rotation complete: {users_rotated} users, "
                          f"{globals_rotated} globals rotated")
                    
                    errors = batch_results.get('errors', [])
                    if errors:
                        print(f"Encountered {len(errors)} errors")
                else:
                    print("Batch rotation complete (no details available)")
            else:
                print(f"Rotation result: {action}")
    
    except KeyboardInterrupt:
        logger.info("Script interrupted by user")
        print("Script interrupted")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Script failed: {e}")
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
