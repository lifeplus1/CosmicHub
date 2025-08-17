"""Salt management administrative API endpoints (backend adapter aware)."""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import Dict, Any, List, Optional, cast
from datetime import datetime, timezone
import time
import asyncio
import os
import logging
from pydantic import BaseModel, Field

from utils.salt_backend import (
    get_salt_backend,
    backend_storage_type,
    SaltBackendProtocol,
)
from utils.salt_storage import reset_salt_storage
from utils.pseudonymization import (
    pseudonymize_user_data,
    pseudonymize_analytics_data,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/salts", tags=["salt-management"])

# Metrics (optional Prometheus) -------------------------------------------------
try:  # pragma: no cover - import guarded
    from prometheus_client import Counter, Gauge, Histogram  # type: ignore
    from typing import Any as _Any
    salt_op_counter: _Any = Counter(  # type: ignore[assignment]
        "salt_operations_total",
        "Total salt management operations",
        ["operation", "result"],
    )  # type: ignore[call-arg]
    salts_due_gauge: _Any = Gauge(  # type: ignore[assignment]
        "salts_due_total",
        "Current salts due for rotation",
        ["kind"],
    )  # type: ignore[call-arg]
    salt_op_latency_hist: _Any = Histogram(  # type: ignore[assignment]
        "salt_operation_latency_seconds",
        "Latency of salt management operations",
        ["operation", "result"],
        buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 2.0, 5.0),
    )  # type: ignore[call-arg]
except Exception:  # Fallback no-op shims
    class _NoOp:
        def labels(self, *_, **__):  # type: ignore[no-untyped-def]
            return self
        def inc(self, *_: object, **__: object) -> None:  # type: ignore[no-untyped-def]
            pass
        def set(self, *_: object, **__: object) -> None:  # type: ignore[no-untyped-def]
            pass
        def observe(self, *_: object, **__: object) -> None:  # type: ignore[no-untyped-def]
            pass
    salt_op_counter = _NoOp()
    salts_due_gauge = _NoOp()
    salt_op_latency_hist = _NoOp()

# --- Admin Guard (lightweight placeholder) ---
try:  # Reuse existing auth if available
    from auth import get_current_user  # type: ignore
except Exception:  # pragma: no cover
    async def get_current_user():  # type: ignore
        return {"uid": "dev-user"}

def admin_guard(user=Depends(get_current_user)) -> dict:  # type: ignore[no-untyped-def]
    """Currently passes through any authenticated user.

    Future: enforce role/claim (e.g., token['admin'] == True) or an allowlist.
    """
    return user


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def _intervals(backend: SaltBackendProtocol) -> Dict[str, int]:
    mem = getattr(backend, "_storage", getattr(backend, "_delegate", None))
    if mem and hasattr(mem, "user_salt_interval_days"):
        return {
            "user_days": getattr(mem, "user_salt_interval_days", 90),
            "global_days": getattr(mem, "global_salt_interval_days", 30),
        }
    return {"user_days": 90, "global_days": 30}


class SaltStatusResponse(BaseModel):
    status: str = Field(default="operational")
    users_due_for_rotation: int
    globals_due_for_rotation: int
    due_users: List[str]
    due_globals: List[str]
    timestamp: str
    storage_type: str
    rotation_intervals: Dict[str, int]


class RotateUserSaltResponse(BaseModel):
    message: str
    user_id: str
    had_existing_salt: bool
    timestamp: str


class RotateGlobalSaltResponse(BaseModel):
    message: str
    salt_type: str
    timestamp: str


class BatchRotateResponse(BaseModel):
    message: str
    users_to_rotate: int
    globals_to_rotate: int
    force: bool
    timestamp: str


class UserSaltAuditResponse(BaseModel):
    user_id: str
    has_salt: bool
    created_at: Optional[str] = None
    last_rotated: Optional[str] = None
    rotation_count: int = 0
    next_rotation: Optional[str] = None
    previous_salt_hash: Optional[str] = None
    timestamp: str


class PseudonymizeTestRequest(BaseModel):
    user_id: str
    identifier: Any
    enable_dev_mode: bool = False
    event_type: str = "events"


class PseudonymizeTestResponse(BaseModel):
    identifier_preview: str
    user_pseudonym: str
    analytics_pseudonym: str
    user_id: str
    event_type: str
    timestamp: str


@router.post("/reload", response_model=SaltStatusResponse)
async def reload_salt_system(user=Depends(admin_guard)) -> SaltStatusResponse:  # type: ignore[no-untyped-def]
    """Explicitly reload salt backend & storage.

    Use in test / admin scenarios to apply new environment variable overrides
    (e.g., USER_SALT_ROTATION_DAYS) without relying on implicit status refresh.
    Returns a fresh status snapshot after reload.
    """
    start_t = time.perf_counter()
    try:
        reset_salt_storage()
        backend = get_salt_backend(refresh=True)
        due = backend.get_salts_due_for_rotation()
        # Update gauges
        try:
            salts_due_gauge.labels("users").set(len(due["users"]))  # type: ignore
            salts_due_gauge.labels("globals").set(len(due["globals"]))  # type: ignore
            salt_op_counter.labels("reload", "success").inc()  # type: ignore
            salt_op_latency_hist.labels("reload", "success").observe(time.perf_counter() - start_t)  # type: ignore
        except Exception:
            pass
        return SaltStatusResponse(
            users_due_for_rotation=len(due["users"]),
            globals_due_for_rotation=len(due["globals"]),
            due_users=due["users"][0:10],
            due_globals=due["globals"],
            timestamp=utc_timestamp(),
            storage_type=backend_storage_type(backend),
            rotation_intervals=_intervals(backend),
        )
    except Exception:  # pragma: no cover
        logger.error("Reload failed", exc_info=True)
        try:
            salt_op_counter.labels("reload", "error").inc()  # type: ignore
            salt_op_latency_hist.labels("reload", "error").observe(time.perf_counter() - start_t)  # type: ignore
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Failed to reload salt backend")


@router.get("/status", response_model=SaltStatusResponse)
async def get_salt_status(user=Depends(admin_guard)) -> SaltStatusResponse:  # type: ignore[no-untyped-def]
    try:
        # If rotation interval env vars set after process start (tests), refresh backend
        refresh_needed = any(env in os.environ for env in (
            "USER_SALT_ROTATION_DAYS",
            "GLOBAL_SALT_ROTATION_DAYS",
        ))
        if refresh_needed:
            reset_salt_storage()
        backend = get_salt_backend(refresh=refresh_needed)
        due = backend.get_salts_due_for_rotation()
        try:
            salts_due_gauge.labels("users").set(len(due["users"]))  # type: ignore
            salts_due_gauge.labels("globals").set(len(due["globals"]))  # type: ignore
        except Exception:
            pass
        return SaltStatusResponse(
            users_due_for_rotation=len(due["users"]),
            globals_due_for_rotation=len(due["globals"]),
            due_users=due["users"][:10],
            due_globals=due["globals"],
            timestamp=utc_timestamp(),
            storage_type=backend_storage_type(backend),
            rotation_intervals=_intervals(backend),
        )
    except Exception:
        logger.error("Status retrieval failed", exc_info=True)
        try:
            salt_op_counter.labels("status", "error").inc()  # type: ignore
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Failed to get salt status")


@router.post("/rotate/user/{user_id}", response_model=RotateUserSaltResponse)
async def rotate_user_salt(user_id: str, background_tasks: BackgroundTasks, force: bool = False, user=Depends(admin_guard)) -> RotateUserSaltResponse:  # type: ignore[no-untyped-def]
    backend = get_salt_backend()
    existing = backend.get_user_salt(user_id)
    if not existing and not force:
        raise HTTPException(status_code=404, detail=f"No salt found for user {user_id}")

    def _task() -> None:
        start_t = time.perf_counter()
        try:
            if existing:
                backend.rotate_user_salt(user_id)
                logger.info("Rotated user salt", extra={"user_id": user_id})
            else:
                backend.create_user_salt(user_id)
                logger.info("Created user salt", extra={"user_id": user_id})
            try:
                salt_op_counter.labels("rotate_user", "success").inc()  # type: ignore
                salt_op_latency_hist.labels("rotate_user", "success").observe(time.perf_counter() - start_t)  # type: ignore
            except Exception:
                pass
        except Exception:  # pragma: no cover
            logger.error("User salt rotation task failed", exc_info=True)
            try:
                salt_op_counter.labels("rotate_user", "error").inc()  # type: ignore
                salt_op_latency_hist.labels("rotate_user", "error").observe(time.perf_counter() - start_t)  # type: ignore
            except Exception:
                pass

    background_tasks.add_task(_task)
    try:
        salt_op_counter.labels("rotate_user", "queued").inc()  # type: ignore
    except Exception:
        pass
    return RotateUserSaltResponse(
        message=f"Salt rotation initiated for user {user_id}",
        user_id=user_id,
        had_existing_salt=existing is not None,
        timestamp=utc_timestamp(),
    )


@router.post("/rotate/global/{salt_type}", response_model=RotateGlobalSaltResponse)
async def rotate_global_salt(salt_type: str, background_tasks: BackgroundTasks, user=Depends(admin_guard)) -> RotateGlobalSaltResponse:  # type: ignore[no-untyped-def]
    backend = get_salt_backend()

    def _task() -> None:
        start_t = time.perf_counter()
        try:
            backend.create_global_salt(salt_type)
            logger.info("Rotated global salt", extra={"salt_type": salt_type})
            try:
                salt_op_counter.labels("rotate_global", "success").inc()  # type: ignore
                salt_op_latency_hist.labels("rotate_global", "success").observe(time.perf_counter() - start_t)  # type: ignore
            except Exception:
                pass
        except Exception:  # pragma: no cover
            logger.error("Global salt rotation task failed", exc_info=True)
            try:
                salt_op_counter.labels("rotate_global", "error").inc()  # type: ignore
                salt_op_latency_hist.labels("rotate_global", "error").observe(time.perf_counter() - start_t)  # type: ignore
            except Exception:
                pass

    background_tasks.add_task(_task)
    try:
        salt_op_counter.labels("rotate_global", "queued").inc()  # type: ignore
    except Exception:
        pass
    return RotateGlobalSaltResponse(
        message=f"Global salt rotation initiated for type {salt_type}",
        salt_type=salt_type,
        timestamp=utc_timestamp(),
    )


@router.post("/rotate/batch", response_model=BatchRotateResponse)
async def rotate_batch_salts(background_tasks: BackgroundTasks, force: bool = False, user=Depends(admin_guard)) -> BatchRotateResponse:  # type: ignore[no-untyped-def]
    backend = get_salt_backend()
    due = backend.get_salts_due_for_rotation()
    if not due["users"] and not due["globals"] and not force:
        return BatchRotateResponse(
            message="No salts are currently due for rotation",
            users_to_rotate=0,
            globals_to_rotate=0,
            force=force,
            timestamp=utc_timestamp(),
        )

    def _task(user_ids: List[str], global_types: List[str]) -> None:
        async def _run():
            start_t = time.perf_counter()
            try:
                res = await backend.batch_rotate_salts(user_ids, global_types)
                logger.info("Batch rotation done", extra=res)  # type: ignore[arg-type]
                try:
                    salt_op_counter.labels("rotate_batch", "success").inc()  # type: ignore
                    salt_op_latency_hist.labels("rotate_batch", "success").observe(time.perf_counter() - start_t)  # type: ignore
                except Exception:
                    pass
            except Exception:  # pragma: no cover
                logger.error("Batch rotation task failed", exc_info=True)
                try:
                    salt_op_counter.labels("rotate_batch", "error").inc()  # type: ignore
                    salt_op_latency_hist.labels("rotate_batch", "error").observe(time.perf_counter() - start_t)  # type: ignore
                except Exception:
                    pass
        asyncio.get_running_loop().create_task(_run())

    background_tasks.add_task(_task, due["users"], due["globals"])
    try:
        salt_op_counter.labels("rotate_batch", "queued").inc()  # type: ignore
    except Exception:
        pass
    return BatchRotateResponse(
        message="Batch salt rotation initiated",
        users_to_rotate=len(due["users"]),
        globals_to_rotate=len(due["globals"]),
        force=force,
        timestamp=utc_timestamp(),
    )


@router.get("/audit/{user_id}", response_model=UserSaltAuditResponse)
async def get_user_salt_audit(user_id: str, user=Depends(admin_guard)) -> UserSaltAuditResponse:  # type: ignore[no-untyped-def]
    backend = get_salt_backend()
    mem = getattr(backend, "_storage", getattr(backend, "_delegate", None))
    raw = {}
    if mem and hasattr(mem, "memory_store"):
        raw = getattr(mem, "memory_store", {}).get(user_id, {})  # type: ignore[arg-type]
    if not raw:
        raise HTTPException(status_code=404, detail=f"No salt information found for user {user_id}")
    user_data = cast(Dict[str, Any], raw)
    return UserSaltAuditResponse(
        user_id=user_id,
        has_salt=bool(user_data.get("salt")),
        created_at=cast(Optional[str], user_data.get("created_at")),
        last_rotated=cast(Optional[str], user_data.get("last_rotated")),
        rotation_count=int(user_data.get("rotation_count", 0) or 0),
        next_rotation=cast(Optional[str], user_data.get("next_rotation")),
        previous_salt_hash=cast(Optional[str], user_data.get("previous_salt_hash")),
        timestamp=utc_timestamp(),
    )


@router.post("/dev/pseudonymize", response_model=PseudonymizeTestResponse)
async def test_pseudonymization(data: PseudonymizeTestRequest, user=Depends(admin_guard)) -> PseudonymizeTestResponse:  # type: ignore[no-untyped-def]
    if not data.enable_dev_mode:
        raise HTTPException(status_code=403, detail="Development mode not enabled")
    if not data.user_id or data.identifier is None:
        raise HTTPException(status_code=400, detail="user_id and identifier are required")
    user_pseudo = pseudonymize_user_data(data.user_id, data.identifier)
    analytics_pseudo = pseudonymize_analytics_data(data.identifier, data.event_type)
    try:
        salt_op_counter.labels("pseudonymize_test", "success").inc()  # type: ignore
    except Exception:
        pass
    return PseudonymizeTestResponse(
        identifier_preview=str(data.identifier)[:10] + "...",
        user_pseudonym=user_pseudo,
        analytics_pseudonym=analytics_pseudo,
        user_id=data.user_id,
        event_type=data.event_type,
        timestamp=utc_timestamp(),
    )
