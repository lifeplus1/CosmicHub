#!/usr/bin/env python3
import os
print("=== Environment Debug ===")
print(f"FIREBASE_PRIVATE_KEY set: {bool(os.getenv('FIREBASE_PRIVATE_KEY'))}")
print(f"FIREBASE_PROJECT_ID: {os.getenv('FIREBASE_PROJECT_ID')}")
print(f"LOG_FILE: {os.getenv('LOG_FILE')}")
print("=== Attempting database import ===")
try:
    from database import save_chart
    print("✓ Database import successful")
except Exception as e:
    print(f"✗ Database import failed: {e}")
