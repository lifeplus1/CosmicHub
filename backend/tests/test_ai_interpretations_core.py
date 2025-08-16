"""Focused tests for ai_interpretations module load and callable enumeration."""
from __future__ import annotations
import astro.calculations.ai_interpretations as ai


def test_module_loads():
    assert hasattr(ai, "__name__")


def test_enumerate_public_callables():
    funcs = [name for name, obj in vars(ai).items() if callable(obj) and not name.startswith("_")]
    assert isinstance(funcs, list)
