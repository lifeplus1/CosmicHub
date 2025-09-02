"""
DATA-001 Phase 1: Configuration for Parquet Export Integration

This configures the dual-format data export system for analytics and ML training.
"""

import os
from pathlib import Path

# DATA-001 Phase 1: Export Configuration
DATA_EXPORT_CONFIG = {
    # Base export directory - can be overridden by environment variable
    'export_base_path': os.environ.get('DATA_EXPORT_PATH', '/tmp/cosmichub_exports'),
    
    # Default export formats (JSON for current system, Parquet for analytics)
    'default_formats': ['json', 'parquet'],
    
    # JSON-only mode for performance testing/comparison
    'json_only_mode': os.environ.get('JSON_ONLY_MODE', '').lower() == 'true',
    
    # Enable/disable background exports
    'enable_background_export': os.environ.get('ENABLE_DATA_EXPORT', '').lower() != 'false',
    
    # Analytics summary generation frequency (in minutes)
    'analytics_summary_interval': int(os.environ.get('ANALYTICS_INTERVAL', '60')),
    
    # Parquet partitioning strategy
    'partition_by_date': True,
    'partition_by_user': False,  # Phase 2 feature
    
    # Data retention (in days)
    'json_retention_days': int(os.environ.get('JSON_RETENTION_DAYS', '30')),
    'parquet_retention_days': int(os.environ.get('PARQUET_RETENTION_DAYS', '365')),
    
    # ML training pipeline preparation
    'enable_ai_interaction_export': True,
    'enable_user_feedback_export': True,
    
    # Performance monitoring
    'track_export_performance': True,
    'export_timeout_seconds': int(os.environ.get('EXPORT_TIMEOUT', '30')),
}


def get_data_export_config():
    """Get current DATA-001 Phase 1 configuration."""
    return DATA_EXPORT_CONFIG.copy()


def is_parquet_export_enabled():
    """Check if Parquet export is enabled (Phase 1 feature flag)."""
    if DATA_EXPORT_CONFIG['json_only_mode']:
        return False
    return DATA_EXPORT_CONFIG['enable_background_export']


def get_export_base_path():
    """Get configured export base path, creating if needed."""
    path = Path(DATA_EXPORT_CONFIG['export_base_path'])
    path.mkdir(parents=True, exist_ok=True)
    return str(path)


def get_default_export_formats():
    """Get default export formats based on configuration."""
    if DATA_EXPORT_CONFIG['json_only_mode']:
        return ['json']
    return DATA_EXPORT_CONFIG['default_formats']


# Production-ready defaults
PRODUCTION_CONFIG = {
    **DATA_EXPORT_CONFIG,
    'export_base_path': '/data/cosmichub/exports',
    'analytics_summary_interval': 30,  # More frequent in production
    'partition_by_user': True,  # Enable user partitioning in production
    'track_export_performance': True,
}


def apply_production_config():
    """Apply production-optimized configuration."""
    DATA_EXPORT_CONFIG.update(PRODUCTION_CONFIG)


# Development shortcuts
def enable_json_only_mode():
    """Enable JSON-only mode for testing current system performance."""
    DATA_EXPORT_CONFIG['json_only_mode'] = True


def enable_dual_format_mode():
    """Enable dual-format mode for DATA-001 Phase 1 testing."""
    DATA_EXPORT_CONFIG['json_only_mode'] = False
    DATA_EXPORT_CONFIG['enable_background_export'] = True


# Analytics warehouse configuration
ANALYTICS_CONFIG = {
    'enable_daily_summaries': True,
    'enable_weekly_reports': True,
    'enable_user_journey_tracking': True,  # Phase 2
    'enable_performance_metrics': True,
    'enable_ml_feature_extraction': True,  # For training pipeline
}


def get_analytics_config():
    """Get analytics warehouse configuration."""
    return ANALYTICS_CONFIG.copy()
