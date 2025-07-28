import pytest
from backend.database import save_chart, get_charts
import sqlite3
import os

@pytest.fixture
def db_setup():
    db_path = "test_charts_unique.db"
    if os.path.exists(db_path):
        os.remove(db_path)
    conn = sqlite3.connect(db_path, detect_types=sqlite3.PARSE_DECLTYPES)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS charts 
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, type TEXT, birth_data TEXT, chart_data TEXT, created_at TIMESTAMP)''')
    conn.commit()
    conn.close()
    os.environ["TEST_DB_PATH"] = db_path
    yield
    if os.path.exists(db_path):
        os.remove(db_path)
    os.environ.pop("TEST_DB_PATH", None)

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
