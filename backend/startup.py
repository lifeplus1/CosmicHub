#!/usr/bin/env python3
import os
import uvicorn

if __name__ == "__main__":
    # Debug environment
    print("=== Startup Debug ===")
    print("All environment variables:")
    for key, value in os.environ.items():
        if 'FIREBASE' in key:
            print(f"{key}: {value[:50]}..." if len(value) > 50 else f"{key}: {value}")
    
    print(f"FIREBASE_PRIVATE_KEY set: {bool(os.getenv('FIREBASE_PRIVATE_KEY'))}")
    print(f"LOG_FILE: {os.getenv('LOG_FILE')}")
    
    # Start uvicorn
    # Use fully qualified module path so it works when executed outside package context
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
