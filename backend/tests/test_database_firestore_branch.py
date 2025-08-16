import sys
from pathlib import Path
from typing import Any, Dict, Mapping
import pytest

ROOT = Path(__file__).resolve().parent.parent
PARENT = ROOT.parent
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))

import backend.database as dbmod  # type: ignore


class FakeChartDoc:
    def __init__(self, data: Dict[str, Any]):
        self._data = data
        self.id = data.get("id", "")
        self.exists = True
    def to_dict(self) -> Dict[str, Any]:  # noqa: D401
        return dict(self._data)
    def get(self) -> "FakeChartDoc":  # noqa: D401
        return self
    def set(self, data: Mapping[str, Any]) -> None:  # noqa: D401
        self._data.update(data)
    def delete(self) -> None:  # noqa: D401
        self.exists = False


class FakeChartsCollection:
    def __init__(self) -> None:
        self.docs: Dict[str, FakeChartDoc] = {}
    def document(self, doc_id: str | None = None) -> FakeChartDoc:  # noqa: D401
        import uuid
        if doc_id is None:
            doc_id = str(uuid.uuid4())
        self.docs.setdefault(doc_id, FakeChartDoc({"id": doc_id}))
        return self.docs[doc_id]
    def order_by(self, *args: Any, **kwargs: Any):  # noqa: D401, ANN401
        return self
    def limit(self, n: int):  # noqa: D401
        self._limit = n
        return self
    def start_after(self, *args: Any, **kwargs: Any):  # noqa: D401, ANN401
        return self
    def stream(self):  # noqa: D401
        docs = list(self.docs.values())
        docs.sort(key=lambda d: d.to_dict().get("created_at", ""), reverse=True)
        return docs[: getattr(self, "_limit", len(docs))]
    def where(self, *args: Any, **kwargs: Any):  # noqa: D401, ANN401
        return self


class FakeUserDoc:
    def __init__(self) -> None:
        self._charts = FakeChartsCollection()
        self._data: Dict[str, Any] = {}
    def collection(self, name: str) -> FakeChartsCollection:  # noqa: D401
        return self._charts
    def set(self, data: Mapping[str, Any], merge: bool = False) -> None:  # noqa: D401
        if merge:
            self._data.update(data)
        else:
            self._data = dict(data)
    def update(self, data: Mapping[str, Any]) -> None:  # noqa: D401
        self._data.update(data)


class FakeUsersCollection:
    def __init__(self) -> None:
        self._users: Dict[str, FakeUserDoc] = {}
    def document(self, user_id: str) -> FakeUserDoc:  # noqa: D401
        self._users.setdefault(user_id, FakeUserDoc())
        return self._users[user_id]


class FakeDB:
    def __init__(self) -> None:
        self._users = FakeUsersCollection()
    def collection(self, name: str):  # noqa: ANN401
        if name == "users":
            return self._users
        return self
    def batch(self):  # noqa: D401
        class B:
            def __init__(self, outer: "FakeDB") -> None:
                self.ops: list[tuple[Any, Mapping[str, Any]]] = []
            def set(self, doc_ref: FakeChartDoc, data: Mapping[str, Any]) -> None:  # noqa: D401
                doc_ref.set(data)
            def commit(self) -> None:  # noqa: D401
                return None
        return B(self)


def _prepare_firestore(monkeypatch: pytest.MonkeyPatch) -> FakeDB:
    fake = FakeDB()
    monkeypatch.setattr(dbmod, "use_memory_db", False)
    # clear cache for get_firestore_client
    dbmod.get_firestore_client.cache_clear()
    monkeypatch.setattr(dbmod, "db", fake)
    monkeypatch.setattr(dbmod, "get_firestore_client", lambda: fake)  # type: ignore[arg-type]
    return fake


def test_firestore_branch_crud(monkeypatch: pytest.MonkeyPatch) -> None:
    _prepare_firestore(monkeypatch)
    user = "fs-user"
    chart = dbmod.save_chart(user, "natal", {"year":2020,"month":1,"day":1,"hour":0,"minute":0,"city":"X"}, {"planets":{}})
    assert chart["id"]
    charts = dbmod.get_charts(user)
    assert len(charts) == 1
    stats = dbmod.get_user_stats(user)
    assert stats["total_charts"] == 1
    deleted = dbmod.delete_chart_by_id(user, chart["id"])
    assert deleted is True


def test_firestore_batch(monkeypatch: pytest.MonkeyPatch) -> None:
    _prepare_firestore(monkeypatch)
    user = "fs-batch"
    ids = dbmod.batch_save_charts(user, [
        {"name":"A","birth_date":"2020-01-01","birth_time":"00:00","birth_location":"X","chart_type":"natal","birth_data":{},"chart_data":{}},
        {"name":"B","birth_date":"2020-01-02","birth_time":"00:00","birth_location":"Y","chart_type":"natal","birth_data":{},"chart_data":{}},
    ])
    assert len(ids) == 2
