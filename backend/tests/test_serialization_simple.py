from api.utils.serialization import serialize_data, deserialize_data, ChartData, UserProfile, NumerologyData

def test_chart_data_serialization():
    """Test basic chart data serialization and deserialization."""
    chart = ChartData(
        planets=[{"name": "Sun", "sign": "Leo", "degree": 15.5, "position": 135.5, "house": "1"}],
        houses=[{"house": 1, "sign": "Leo", "degree": 15.5, "cusp": 135.5, "ruler": "Sun"}],
        aspects=[{"planet1": "Sun", "planet2": "Moon", "type": "conjunction"}]
    )
    serialized = serialize_data(chart)
    assert isinstance(serialized, str)
    assert "Sun" in serialized
    assert "Leo" in serialized

def test_user_profile_serialization():
    """Test user profile serialization."""
    profile = UserProfile(
        user_id="test-user-123",
        birth_data={"date": "1990-01-01", "time": "12:00", "location": "New York, NY"}
    )
    serialized = serialize_data(profile)
    assert isinstance(serialized, str)
    assert "test-user-123" in serialized
    assert "1990-01-01" in serialized

def test_numerology_serialization():
    """Test numerology data serialization."""
    numerology = NumerologyData(life_path=7, destiny=3, personal_year=2025)
    serialized = serialize_data(numerology)
    assert isinstance(serialized, str)
    assert "7" in serialized
    assert "2025" in serialized

def test_deserialization():
    """Test basic deserialization."""
    chart = ChartData(
        planets=[],
        houses=[],
        aspects=[]
    )
    serialized = serialize_data(chart)
    deserialized = deserialize_data(serialized, ChartData)
    assert isinstance(deserialized, ChartData)
    assert deserialized.planets == []
