"""Compatibility shim for legacy hyphenated data-export directory.

Imports are standardized on `data_export`. This module proxies to the
canonical implementation if available.
"""
from importlib import import_module as _import_module

try:  # pragma: no cover
    _pkg = _import_module("data_export")
    ParquetExporter = getattr(_pkg, "ParquetExporter", None)
    get_export_base_path = getattr(_pkg, "get_export_base_path", lambda: "/tmp/cosmichub_exports")
    is_parquet_export_enabled = getattr(_pkg, "is_parquet_export_enabled", lambda: False)
except Exception:  # pragma: no cover
    ParquetExporter = None
    get_export_base_path = lambda: "/tmp/cosmichub_exports"  # type: ignore
    is_parquet_export_enabled = lambda: False  # type: ignore

__all__ = [
    "ParquetExporter",
    "get_export_base_path",
    "is_parquet_export_enabled",
]
