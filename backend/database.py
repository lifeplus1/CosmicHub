import sqlite3
import json
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'data/charts.db')

def adapt_datetime(dt):
    return dt.isoformat()

def convert_datetime(s):
    return datetime.fromisoformat(s.decode())

sqlite3.register_adapter(datetime, adapt_datetime)
sqlite3.register_converter("TIMESTAMP", convert_datetime)

def save_chart(uid, chart_type, birth_data, chart_data):
    db_path = os.getenv("TEST_DB_PATH", "charts.db")
    conn = sqlite3.connect(db_path, detect_types=sqlite3.PARSE_DECLTYPES)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS charts 
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, type TEXT, birth_data TEXT, chart_data TEXT, created_at TIMESTAMP)''')
    cursor.execute('INSERT INTO charts (user_id, type, birth_data, chart_data, created_at) VALUES (?, ?, ?, ?, ?)',
                   (uid, chart_type, json.dumps(birth_data), json.dumps(chart_data), datetime.now()))
    conn.commit()
    conn.close()
    return {"message": "Chart saved successfully"}

def get_charts(uid):
    db_path = os.getenv("TEST_DB_PATH", "charts.db")
    conn = sqlite3.connect(db_path, detect_types=sqlite3.PARSE_DECLTYPES)
    cursor = conn.cursor()
    cursor.execute('SELECT id, type, birth_data, chart_data, created_at FROM charts WHERE user_id = ?', (uid,))
    charts = cursor.fetchall()
    conn.close()
    return [{"id": c[0], "type": c[1], "birth_data": json.loads(c[2]), "chart_data": json.loads(c[3]), "created_at": c[4]} for c in charts]
