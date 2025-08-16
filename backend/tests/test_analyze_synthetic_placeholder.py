def test_import_analyze_synthetic():
    import importlib
    m = importlib.import_module('scripts.observability.analyze_synthetic')
    assert hasattr(m, 'main')
