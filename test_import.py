import sys
sys.path.append('.')
try:
    from backend.security import SecurityManager
    print('Import successful')
    print(f'SecurityManager class: {SecurityManager}')
    # Test instantiation
    manager = SecurityManager()
    print(f'SecurityManager instance created: {type(manager)}')
except Exception as e:
    print(f'Import error: {e}')
