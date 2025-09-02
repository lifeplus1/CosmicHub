"""
DATA-001 Phase 1: Parquet Data Export Foundation

Dual-format data export capability maintaining current JSON performance
while building foundation for analytics warehouse and ML training pipeline.
"""

import json
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
import logging

logger = logging.getLogger(__name__)

class ParquetExporter:
    """
    Dual-format data exporter for CosmicHub analytics pipeline.
    
    Maintains current JSON performance while building Parquet foundation
    for future ML training and analytics warehouse capabilities.
    """
    
    def __init__(self, export_base_path: str = "data/exports"):
        self.export_base_path = Path(export_base_path)
        self.export_base_path.mkdir(parents=True, exist_ok=True)
        
    def export_chart_calculation(self, 
                                chart_data: Dict[str, Any], 
                                user_id: Optional[str] = None,
                                formats: List[str] = ["json", "parquet"]) -> Dict[str, str]:
        """
        Export chart calculation data in multiple formats.
        
        Args:
            chart_data: Chart calculation result from PySwissEph
            user_id: Optional user identifier (anonymized)
            formats: List of export formats ("json", "parquet", or both)
            
        Returns:
            Dictionary with export paths for each format
        """
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        session_id = chart_data.get('session_id', f'calc_{timestamp}')
        
        export_paths = {}
        
        # Always maintain JSON for current system compatibility
        if "json" in formats:
            json_path = self._export_json(chart_data, session_id, timestamp)
            export_paths["json"] = str(json_path)
            
        # Add Parquet for analytics pipeline foundation
        if "parquet" in formats:
            parquet_path = self._export_parquet(chart_data, session_id, timestamp, user_id)
            export_paths["parquet"] = str(parquet_path)
            
        return export_paths
        
    def export_ai_interaction(self,
                            interaction_data: Dict[str, Any],
                            formats: List[str] = ["json", "parquet"]) -> Dict[str, str]:
        """
        Export AI-001 interaction data for training pipeline.
        
        Critical for Phase 3 ML training data pipeline and reward model training.
        """
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        interaction_id = interaction_data.get('interaction_id', f'ai_{timestamp}')
        
        export_paths = {}
        
        if "json" in formats:
            json_path = self._export_ai_json(interaction_data, interaction_id, timestamp)
            export_paths["json"] = str(json_path)
            
        if "parquet" in formats:
            parquet_path = self._export_ai_parquet(interaction_data, interaction_id, timestamp)
            export_paths["parquet"] = str(parquet_path)
            
        return export_paths
        
    def _export_json(self, data: Dict[str, Any], session_id: str, timestamp: str) -> Path:
        """Export chart data as JSON (maintains current performance)."""
        json_dir = self.export_base_path / "json" / "charts"
        json_dir.mkdir(parents=True, exist_ok=True)
        
        json_path = json_dir / f"{session_id}_{timestamp}.json"
        
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
            
        return json_path
        
    def _export_parquet(self, data: Dict[str, Any], session_id: str, timestamp: str, user_id: Optional[str]) -> Path:
        """Export chart data as Parquet for analytics warehouse."""
        parquet_dir = self.export_base_path / "parquet" / "charts"
        parquet_dir.mkdir(parents=True, exist_ok=True)
        
        # Transform nested JSON to flat structure for Parquet
        flattened_data = self._flatten_chart_data(data, user_id)
        
        # Create DataFrame
        df = pd.DataFrame([flattened_data])
        
        # Define Parquet file path with partitioning strategy
        date_partition = datetime.utcnow().strftime("%Y%m%d")
        parquet_path = parquet_dir / f"date={date_partition}" / f"{session_id}_{timestamp}.parquet"
        parquet_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write Parquet with compression
        df.to_parquet(parquet_path, compression='snappy', index=False)
        
        return parquet_path
        
    def _export_ai_json(self, data: Dict[str, Any], interaction_id: str, timestamp: str) -> Path:
        """Export AI interaction as JSON."""
        json_dir = self.export_base_path / "json" / "ai_interactions"
        json_dir.mkdir(parents=True, exist_ok=True)
        
        json_path = json_dir / f"{interaction_id}_{timestamp}.json"
        
        with open(json_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
            
        return json_path
        
    def _export_ai_parquet(self, data: Dict[str, Any], interaction_id: str, timestamp: str) -> Path:
        """Export AI interaction as Parquet for ML training pipeline."""
        parquet_dir = self.export_base_path / "parquet" / "ai_interactions"
        parquet_dir.mkdir(parents=True, exist_ok=True)
        
        # Flatten AI interaction data for ML training
        flattened_data = self._flatten_ai_interaction_data(data)
        
        df = pd.DataFrame([flattened_data])
        
        date_partition = datetime.utcnow().strftime("%Y%m%d")
        parquet_path = parquet_dir / f"date={date_partition}" / f"{interaction_id}_{timestamp}.parquet"
        parquet_path.parent.mkdir(parents=True, exist_ok=True)
        
        df.to_parquet(parquet_path, compression='snappy', index=False)
        
        return parquet_path
        
    def _flatten_chart_data(self, data: Dict[str, Any], user_id: Optional[str]) -> Dict[str, Any]:
        """
        Flatten chart calculation data for Parquet analytics.
        
        Extracts key metrics for business intelligence and pattern analysis.
        """
        flattened = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_id_hash': user_id,
            'calculation_type': data.get('chart_type', 'natal'),
            'processing_time_ms': data.get('processing_time', 0),
            'success': data.get('success', True),
            'error_code': data.get('error_code'),
            'astrology_system': data.get('system', 'western'),
            'birth_date': data.get('birth_data', {}).get('date'),
            'birth_location': data.get('birth_data', {}).get('location'),
        }
        
        # Extract planet count and aspect count for analysis
        if 'planets' in data:
            flattened['planet_count'] = len(data['planets'])
            
        if 'aspects' in data:
            flattened['aspect_count'] = len(data['aspects'])
            
        # Extract house system for preference analysis
        if 'house_system' in data:
            flattened['house_system'] = data['house_system']
            
        return flattened
        
    def _flatten_ai_interaction_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Flatten AI-001 interaction data for ML training pipeline.
        
        Critical for Phase 3 reward model training and pattern recognition.
        """
        flattened = {
            'timestamp': datetime.utcnow().isoformat(),
            'interaction_type': data.get('type', 'question_answer'),
            'feature_used': data.get('feature', 'custom_qa'),
            'query_length': len(data.get('query', '')),
            'response_length': len(data.get('response', '')),
            'processing_time_ms': data.get('processing_time', 0),
            'model_used': data.get('model', 'grok-beta'),
            'confidence_score': data.get('confidence', 0.0),
            'user_rating': data.get('user_rating'),  # For reward model training
            'chart_context': bool(data.get('chart_data')),
            'follow_up': bool(data.get('follow_up')),
        }
        
        # Extract query categories for training data classification
        if 'categories' in data:
            for i, category in enumerate(data['categories'][:5]):  # Top 5 categories
                flattened[f'category_{i+1}'] = category
                
        return flattened
        
    def create_analytics_summary(self, date_range: Optional[tuple] = None) -> Dict[str, Any]:
        """
        Generate analytics summary from Parquet files.
        
        Foundation for Phase 2 analytics warehouse pipeline.
        """
        charts_dir = self.export_base_path / "parquet" / "charts"
        
        if not charts_dir.exists():
            return {"error": "No chart data available"}
            
        # Read all Parquet files in date range
        parquet_files = list(charts_dir.glob("**/*.parquet"))
        
        if not parquet_files:
            return {"error": "No Parquet files found"}
            
        # Combine all data for analysis
        dataframes = []
        for file_path in parquet_files[:100]:  # Limit for demo
            try:
                df = pd.read_parquet(file_path)
                dataframes.append(df)
            except Exception as e:
                logger.warning(f"Could not read {file_path}: {e}")
                
        if not dataframes:
            return {"error": "No readable data found"}
            
        combined_df = pd.concat(dataframes, ignore_index=True)
        
        # Generate analytics summary
        summary = {
            'total_calculations': len(combined_df),
            'date_range': {
                'start': combined_df['timestamp'].min(),
                'end': combined_df['timestamp'].max()
            },
            'chart_types': combined_df['calculation_type'].value_counts().to_dict(),
            'average_processing_time': combined_df['processing_time_ms'].mean(),
            'success_rate': combined_df['success'].mean() * 100,
            'astrology_systems': combined_df['astrology_system'].value_counts().to_dict(),
        }
        
        return summary

# DATA-001 Phase 1 Integration Helper
def initialize_parquet_exports(app_config: Optional[Dict[str, Any]] = None) -> ParquetExporter:
    """
    Initialize Parquet export system for CosmicHub.
    
    Call this during FastAPI startup to enable dual-format data export.
    """
    export_path = "data/exports"
    if app_config and 'data_export_path' in app_config:
        export_path = app_config['data_export_path']
        
    exporter = ParquetExporter(export_path)
    
    logger.info("DATA-001 Phase 1: Parquet export foundation initialized")
    logger.info(f"Export path: {exporter.export_base_path}")
    
    return exporter
