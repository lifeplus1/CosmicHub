import pytest
from backend.database import save_chart, get_charts
import sqlite3
import os

@pytest.fixture
def db_setup():
    if os.path.exists("test_charts.db"):
        os.remove("test_charts.db")
    yield
    if os.path.exists("test_charts.db"):
        os.remove("test_charts.db")

def test_save_and_get_charts(db_setup):
    uid = "test_user"
    chart_type = "natal"
    birth_data = {"year": 2000, "month": 7, "day": 27}
    chart_data = {"planets": {"Sun": {"sign": "Leo"}}}
    save_chart(uid, chart_type, birth_data, chart_data)
    charts = get_charts(uid)
    assert len(charts) == 1
    assert charts[0]["type"] == "natal"
    assert charts[0]["birth_data"] == birth_data
