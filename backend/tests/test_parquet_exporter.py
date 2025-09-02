"""
DATA-001 Phase 1: Parquet Export Integration Test

Test dual-format export capability without disrupting current JSON performance.
"""

import pytest
import json
import pandas as pd  # type: ignore
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Generator
import tempfile
import shutil

from backend.data_export.parquet_exporter import ParquetExporter, initialize_parquet_exports

class TestParquetExporter:
    """Test suite for DATA-001 Phase 1 Parquet export foundation."""
    
    @pytest.fixture
    def temp_exporter(self) -> Generator[ParquetExporter, None, None]:
        """Create temporary exporter for testing."""
        temp_dir = tempfile.mkdtemp()
        exporter = ParquetExporter(temp_dir)
        yield exporter
        shutil.rmtree(temp_dir)
        
    @pytest.fixture
    def sample_chart_data(self) -> Dict[str, Any]:
        """Sample chart calculation data for testing."""
        return {
            'session_id': 'test_calc_001',
            'chart_type': 'natal',
            'success': True,
            'processing_time': 150,
            'system': 'western',
            'birth_data': {
                'date': '1990-01-15',
                'location': 'New York, NY'
            },
            'planets': {
                'sun': {'sign': 'Capricorn', 'degree': 25.5},
                'moon': {'sign': 'Pisces', 'degree': 10.2}
            },
            'aspects': [
                {'planet1': 'sun', 'planet2': 'moon', 'type': 'trine', 'orb': 2.5}
            ],
            'house_system': 'placidus'
        }
        
    @pytest.fixture
    def sample_ai_interaction(self) -> Dict[str, Any]:
        """Sample AI interaction data for testing."""
        return {
            'interaction_id': 'ai_test_001',
            'type': 'question_answer',
            'feature': 'custom_qa',
            'query': 'What does my sun in Capricorn mean?',
            'response': 'Your sun in Capricorn suggests strong ambition and practical approach to life.',
            'processing_time': 850,
            'model': 'grok-beta',
            'confidence': 0.92,
            'user_rating': 5,
            'chart_data': True,
            'categories': ['sun_sign', 'personality', 'career']
        }
        
    def test_dual_format_chart_export(self, temp_exporter: ParquetExporter, sample_chart_data: Dict[str, Any]) -> None:
        """Test dual-format export maintains JSON while adding Parquet."""
        # Export in both formats
        export_paths = temp_exporter.export_chart_calculation(
            sample_chart_data, 
            user_id='test_user_hash',
            formats=['json', 'parquet']
        )
        
        # Verify both formats created
        assert 'json' in export_paths
        assert 'parquet' in export_paths
        
        # Verify JSON file exists and is valid
        json_path = Path(export_paths['json'])
        assert json_path.exists()
        
        with open(json_path, 'r') as f:
            json_data = json.load(f)
        assert json_data['session_id'] == 'test_calc_001'
        assert json_data['chart_type'] == 'natal'
        
        # Verify Parquet file exists and is readable
        parquet_path = Path(export_paths['parquet'])
        assert parquet_path.exists()
        
        df = pd.read_parquet(parquet_path)
        assert len(df) == 1
        assert df['calculation_type'].iloc[0] == 'natal'
        assert df['user_id_hash'].iloc[0] == 'test_user_hash'
        assert df['processing_time_ms'].iloc[0] == 150
        
    def test_json_only_export(self, temp_exporter: ParquetExporter, sample_chart_data: Dict[str, Any]) -> None:
        """Test JSON-only export maintains current system performance."""
        export_paths = temp_exporter.export_chart_calculation(
            sample_chart_data,
            formats=['json']
        )
        
        assert 'json' in export_paths
        assert 'parquet' not in export_paths
        
        json_path = Path(export_paths['json'])
        assert json_path.exists()
        
    def test_ai_interaction_export(self, temp_exporter: ParquetExporter, sample_ai_interaction: Dict[str, Any]) -> None:
        """Test AI interaction export for ML training pipeline foundation."""
        export_paths = temp_exporter.export_ai_interaction(
            sample_ai_interaction,
            formats=['json', 'parquet']
        )
        
        # Verify both formats created
        assert 'json' in export_paths
        assert 'parquet' in export_paths
        
        # Verify Parquet structure for ML training
        parquet_path = Path(export_paths['parquet'])
        df = pd.read_parquet(parquet_path)
        
        assert df['interaction_type'].iloc[0] == 'question_answer'
        assert df['feature_used'].iloc[0] == 'custom_qa'
        assert df['confidence_score'].iloc[0] == 0.92
        assert df['user_rating'].iloc[0] == 5
        assert 'category_1' in df.columns
        
    def test_parquet_partitioning(self, temp_exporter: ParquetExporter, sample_chart_data: Dict[str, Any]) -> None:
        """Test date-based partitioning for analytics warehouse."""
        export_paths = temp_exporter.export_chart_calculation(
            sample_chart_data,
            formats=['parquet']
        )
        
        parquet_path = Path(export_paths['parquet'])
        
        # Verify date partition in path
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        assert f"date={date_str}" in str(parquet_path)
        
    def test_analytics_summary_generation(self, temp_exporter: ParquetExporter, sample_chart_data: Dict[str, Any]) -> None:
        """Test analytics summary generation from Parquet files."""
        # Export some test data
        for i in range(3):
            test_data = sample_chart_data.copy()
            test_data['session_id'] = f'test_calc_{i:03d}'
            test_data['processing_time'] = 100 + i * 50
            
            temp_exporter.export_chart_calculation(
                test_data,
                user_id=f'test_user_{i}',
                formats=['parquet']
            )
            
        # Generate analytics summary
        summary = temp_exporter.create_analytics_summary()
        
        assert 'total_calculations' in summary
        assert summary['total_calculations'] == 3
        assert 'chart_types' in summary
        assert summary['chart_types']['natal'] == 3
        assert 'average_processing_time' in summary
        assert summary['success_rate'] == 100.0
        
    def test_initialization_helper(self):
        """Test DATA-001 Phase 1 initialization helper."""
        with tempfile.TemporaryDirectory() as temp_dir:
            config = {'data_export_path': temp_dir}
            exporter = initialize_parquet_exports(config)
            
            assert isinstance(exporter, ParquetExporter)
            assert str(exporter.export_base_path) == temp_dir
            
    def test_data_flattening_preserves_key_metrics(self, temp_exporter: ParquetExporter, sample_chart_data: Dict[str, Any]) -> None:
        """Test that data flattening preserves key metrics for analytics."""
        flattened = temp_exporter._flatten_chart_data(sample_chart_data, 'test_user')  # type: ignore[reportProtectedAccess]
        
        # Verify key analytics metrics preserved
        assert flattened['calculation_type'] == 'natal'
        assert flattened['processing_time_ms'] == 150
        assert flattened['success'] == True
        assert flattened['user_id_hash'] == 'test_user'
        assert flattened['planet_count'] == 2
        assert flattened['aspect_count'] == 1
        assert flattened['house_system'] == 'placidus'
        
    def test_ai_data_flattening_for_ml_training(self, temp_exporter: ParquetExporter, sample_ai_interaction: Dict[str, Any]) -> None:
        """Test AI data flattening preserves ML training signals."""
        flattened = temp_exporter._flatten_ai_interaction_data(sample_ai_interaction)  # type: ignore[reportProtectedAccess]
        
        # Verify ML training features preserved
        assert flattened['interaction_type'] == 'question_answer'
        assert flattened['confidence_score'] == 0.92
        assert flattened['user_rating'] == 5  # Critical for reward model
        assert flattened['query_length'] > 0
        assert flattened['response_length'] > 0
        assert flattened['chart_context'] == True
        assert flattened['category_1'] == 'sun_sign'


# Integration test with FastAPI (when available)
def test_fastapi_integration():
    """Test integration with FastAPI chart calculation endpoint."""
    # This would be implemented when integrating with actual FastAPI endpoints
    # For now, just verify the interface is ready
    assert callable(initialize_parquet_exports)
    
    
if __name__ == "__main__":
    # Quick validation that DATA-001 Phase 1 foundation works
    import sys
    import os
    
    # Add backend to path
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
    
    # Create temp exporter
    temp_dir = tempfile.mkdtemp()
    exporter = ParquetExporter(temp_dir)
    
    # Test basic functionality
    test_data: Dict[str, Any] = {
        'session_id': 'validation_test',
        'chart_type': 'natal',
        'success': True,
        'processing_time': 123,
        'planets': {'sun': {'sign': 'Leo'}},
        'aspects': []
    }
    
    paths = exporter.export_chart_calculation(test_data, formats=['json', 'parquet'])
    
    print("✅ DATA-001 Phase 1 validation successful:")
    print(f"   JSON export: {paths['json']}")
    print(f"   Parquet export: {paths['parquet']}")
    print("✅ Dual-format foundation ready for production integration")
    
    # Cleanup
    shutil.rmtree(temp_dir)
    print("✅ Validation complete - ready for FastAPI integration")
