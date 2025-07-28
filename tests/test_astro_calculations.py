import pytest
from backend.astro_calculations import get_location, calculate_chart

def test_get_location():
    cities = {"New York, USA": {"city": "New York, USA", "latitude": 40.71, "longitude": -74.01, "timezone": "America/New_York"}}
    result = get_location("New York, USA", cities)
    assert result["city"] == "New York, USA"
    assert result["latitude"] == 40.71
    assert result["longitude"] == -74.01
    assert result["timezone"] == "America/New_York"

def test_calculate_chart():
    result = calculate_chart(2000, 7, 27, 12, 0, 40.71, -74.01, "America/New_York")
    assert "planets" in result
    assert "Sun" in result["planets"]
    assert "houses" in result
    assert "angles" in result
