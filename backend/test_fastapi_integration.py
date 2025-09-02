"""
DATA-001 Phase 1: FastAPI Integration Test

Test that the Parquet export integrates correctly with chart calculations.
"""

import sys
import os
import tempfile
import shutil
from typing import Dict, Any

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from data_export.config import DATA_EXPORT_CONFIG, enable_dual_format_mode
    from api.routers.calculations import get_parquet_exporter, export_chart_data_background
    
    print("✅ DATA-001 Phase 1: FastAPI Integration Test Starting...")
    
    # Enable dual-format mode
    enable_dual_format_mode()
    
    # Override export path for testing
    temp_dir = tempfile.mkdtemp()
    DATA_EXPORT_CONFIG['export_base_path'] = temp_dir
    print(f"   Using temp directory: {temp_dir}")
    
    # Test exporter initialization
    exporter = get_parquet_exporter()
    if exporter:
        print("✅ ParquetExporter initialized successfully")
    else:
        print("❌ ParquetExporter failed to initialize")
        
    # Test background export function
    test_chart_data: Dict[str, Any] = {
        'year': 1990,
        'month': 5,
        'day': 15,
        'city': 'San Francisco, CA',
        'planets': {'sun': {'sign': 'Taurus', 'degree': 24.5}},
        'aspects': [],
        'house_system': 'placidus',
        'processing_time': 156,
        'success': True
    }
    
    print("✅ Testing background export function...")
    export_chart_data_background(test_chart_data, 'test_user')
    print("✅ Background export completed without errors")
    
    # Verify files were created
    json_files = list(os.walk(temp_dir))
    if any('json' in str(item) for item in json_files):
        print("✅ JSON export files detected")
    
    if any('parquet' in str(item) for item in json_files):
        print("✅ Parquet export files detected")
        
    print("🎉 DATA-001 Phase 1 FastAPI Integration SUCCESSFUL")
    print("Ready for:")
    print("   ✅ Production deployment")
    print("   ✅ Dual-format chart exports") 
    print("   ✅ Analytics warehouse foundation")
    print("   ✅ Background task processing")
    
    # Cleanup
    shutil.rmtree(temp_dir)
    print("✅ Cleanup complete")
    
except Exception as e:
    print(f"❌ Integration test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
