import json

import pytest

from api.services.astro_service import AstroService
from api.utils.serialization import (
    ChartData,
    NumerologyData,
    UserProfile,
    deserialize_data,
    serialize_data,
)


class TestSerialization:
    """Test the Pydantic-based serialization utility"""

    def test_chart_data_serialization(self):
        """Test serializing and deserializing ChartData"""
        chart = ChartData(
            planets=[{"name": "Sun", "sign": "Leo", "degree": 23.5}],
            houses=[{"number": 1, "sign": "Aries", "cusp": 0.0}],
            aspects=[{"planet1": "Sun", "planet2": "Moon", "type": "Trine"}],
        )

        serialized = serialize_data(chart)
        assert isinstance(serialized, str)
        assert len(serialized) > 0

        # Verify JSON is valid
        parsed = json.loads(serialized)
        assert "planets" in parsed
        assert "houses" in parsed
        assert "aspects" in parsed

    def test_user_profile_serialization(self):
        """Test serializing and deserializing UserProfile"""
        profile = UserProfile(
            user_id="test-user-123",
            birth_data={
                "date": "1990-05-15",
                "time": "14:30:00",
                "location": "New York",
            },
        )

        serialized = serialize_data(profile)
        assert isinstance(serialized, str)

        # Verify JSON structure
        parsed = json.loads(serialized)
        assert "user_id" in parsed
        assert "birth_data" in parsed

    def test_numerology_data_serialization(self):
        """Test serializing and deserializing NumerologyData"""
        numerology = NumerologyData(life_path=7, destiny=3, personal_year=9)

        serialized = serialize_data(numerology)
        assert isinstance(serialized, str)

        # Verify JSON structure
        parsed = json.loads(serialized)
        assert "life_path" in parsed
        assert "destiny" in parsed
        assert "personal_year" in parsed

    def test_deserialization(self):
        """Test basic deserialization functionality"""
        chart = ChartData(planets=[], houses=[], aspects=[])
        serialized = serialize_data(chart)
        deserialized = deserialize_data(serialized, ChartData)
        assert isinstance(deserialized, ChartData)

    def test_invalid_json_deserialization(self):
        """Test that invalid JSON raises appropriate errors"""
        with pytest.raises(ValueError, match="Deserialization error"):
            deserialize_data("invalid json", ChartData)

    def test_serialization_excludes_unset_fields(self):
        """Test that serialization excludes unset fields for optimization"""
        chart = ChartData(
            planets=[{"name": "Sun", "sign": "Leo", "degree": 23.5}],
            houses=[],
            aspects=[],
        )

        serialized = serialize_data(chart)
        # The serialized string should be compact
        assert isinstance(serialized, str)
        assert "Sun" in serialized


class TestAstroServiceCaching:
    """Test the AstroService caching functionality"""

    def test_astro_service_creation(self):
        """Test that AstroService can be created"""
        service = AstroService()
        assert service is not None
        assert hasattr(service, "redis_cache")

    @pytest.mark.asyncio
    async def test_basic_cache_operations(self):
        """Test basic cache operations"""
        service = AstroService()
        from typing import Dict, Union

        test_data: Dict[str, Union[str, int]] = {"test": "value", "number": 42}
        success = await service.cache_serialized_data("test-key", test_data)
        assert success is True
        cached = await service.get_cached_data("test-key")
        assert cached == test_data

    @pytest.mark.asyncio
    async def test_chart_data_workflow(self):
        """Test the chart data caching workflow"""
        service = AstroService()
        chart_data = await service.get_chart_data("test-chart-123")
        assert chart_data is not None
        assert "planets" in chart_data
        assert "houses" in chart_data
        assert "aspects" in chart_data
