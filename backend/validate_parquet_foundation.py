"""
DATA-001 Phase 1: Quick Validation Script

Verify dual-format export foundation works before FastAPI integration.
"""

import sys
import os
import json
import tempfile
import shutil
from pathlib import Path
from typing import Dict, Any

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from data_export.parquet_exporter import ParquetExporter, initialize_parquet_exports
    import pandas as pd
    
    print("✅ DATA-001 Phase 1: Starting validation...")
    
    # Create temp directory
    temp_dir = tempfile.mkdtemp()
    print(f"   Using temp directory: {temp_dir}")
    
    # Initialize exporter
    exporter = ParquetExporter(temp_dir)
    print("✅ ParquetExporter initialized")
    
    # Test chart calculation export
    chart_data: Dict[str, Any] = {
        'session_id': 'validation_001',
        'chart_type': 'natal',
        'success': True,
        'processing_time': 125,
        'system': 'western',
        'birth_data': {
            'date': '1990-05-15',
            'location': 'San Francisco, CA'
        },
        'planets': {
            'sun': {'sign': 'Taurus', 'degree': 24.3},
            'moon': {'sign': 'Virgo', 'degree': 12.8}
        },
        'aspects': [
            {'planet1': 'sun', 'planet2': 'moon', 'type': 'trine', 'orb': 1.5}
        ],
        'house_system': 'placidus'
    }
    
    # Export in both formats
    export_paths = exporter.export_chart_calculation(
        chart_data,
        user_id='validation_user',
        formats=['json', 'parquet']
    )
    
    print("✅ Dual-format export successful:")
    print(f"   JSON: {export_paths['json']}")
    print(f"   Parquet: {export_paths['parquet']}")
    
    # Validate JSON
    json_path = Path(export_paths['json'])
    if json_path.exists():
        with open(json_path, 'r') as f:
            json_data = json.load(f)
        print(f"✅ JSON validation: {json_data['session_id']} - {json_data['chart_type']}")
    
    # Validate Parquet
    parquet_path = Path(export_paths['parquet'])
    if parquet_path.exists():
        df = pd.read_parquet(parquet_path)
        print(f"✅ Parquet validation: {len(df)} records, columns: {list(df.columns)[:5]}...")
        print(f"   Processing time: {df['processing_time_ms'].iloc[0]}ms")
        print(f"   Chart type: {df['calculation_type'].iloc[0]}")
    
    # Test AI interaction export
    ai_data: Dict[str, Any] = {
        'interaction_id': 'validation_ai_001',
        'type': 'question_answer',
        'feature': 'custom_qa',
        'query': 'What does my sun in Taurus mean?',
        'response': 'Sun in Taurus suggests stability, determination, and appreciation for beauty.',
        'processing_time': 750,
        'model': 'grok-beta',
        'confidence': 0.89,
        'user_rating': 4,
        'chart_data': True,
        'categories': ['sun_sign', 'personality']
    }
    
    ai_export_paths = exporter.export_ai_interaction(
        ai_data,
        formats=['json', 'parquet']
    )
    
    print("✅ AI interaction export successful:")
    print(f"   JSON: {ai_export_paths['json']}")  
    print(f"   Parquet: {ai_export_paths['parquet']}")
    
    # Test analytics summary
    summary = exporter.create_analytics_summary()
    print("✅ Analytics summary generated:")
    print(f"   Total calculations: {summary.get('total_calculations', 0)}")
    print(f"   Success rate: {summary.get('success_rate', 0)}%")
    
    # Test initialization helper
    config = {'data_export_path': temp_dir}
    init_exporter = initialize_parquet_exports(config)
    print("✅ Initialization helper works")
    
    # Cleanup
    shutil.rmtree(temp_dir)
    print("✅ Cleanup complete")
    
    print("\n🎉 DATA-001 Phase 1 Foundation Validation SUCCESSFUL")
    print("Ready for:")
    print("   ✅ FastAPI integration")
    print("   ✅ Production dual-format exports")
    print("   ✅ Analytics warehouse foundation")
    print("   ✅ ML training pipeline data prep")
    
except Exception as e:
    print(f"❌ Validation failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
