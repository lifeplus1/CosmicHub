from __future__ import annotations
from dataclasses import dataclass
from typing import Generic, TypeVar, Union, Callable, Any, cast

T = TypeVar("T")
U = TypeVar("U")

@dataclass
class ApiSuccess(Generic[T]):
    success: bool
    data: T
    message: str | None = None

    def __init__(self, data: T, message: str | None = None) -> None:
        self.success = True
        self.data = data
        self.message = message

@dataclass
class ApiFailure:
    success: bool
    error: str
    code: str | None = None
    details: Any | None = None

    def __init__(self, error: str, code: str | None = None, details: Any | None = None) -> None:
        self.success = False
        self.error = error
        self.code = code
        self.details = details

ApiResult = Union[ApiSuccess[T], ApiFailure]

# Helper constructors

def ok(data: T, message: str | None = None) -> ApiSuccess[T]:
    return ApiSuccess(data, message)

def fail(error: str, code: str | None = None, details: Any | None = None) -> ApiFailure:
    return ApiFailure(error, code, details)

# Mapping HTTP-like errors

class FailureOptions:
    def __init__(self, *, auth: str | None = None, not_found: str | None = None, validation: str | None = None, default_msg: str):
        self.auth = auth or "Authentication required"
        self.not_found = not_found or "Resource not found"
        self.validation = validation or "Validation error"
        self.default_msg = default_msg

def to_failure(error: Any, opts: FailureOptions) -> ApiFailure:
    # Expect error to maybe have .status or .response.status
    status = None
    if hasattr(error, "status") and isinstance(getattr(error, "status"), int):
        status = getattr(error, "status")
    else:
        resp = getattr(error, "response", None)
        if resp is not None:
            status = getattr(resp, "status", None)
    if status == 401:
        return fail(opts.auth, "401")
    if status == 404:
        return fail(opts.not_found, "404")
    if status == 400:
        return fail(opts.validation, "400")
    return fail(opts.default_msg)

# Type guards / utilities

def is_success(result: ApiResult[T]) -> bool:
    return result.success is True  # type: ignore[attr-defined]

def is_failure(result: ApiResult[T]) -> bool:
    return result.success is False  # type: ignore[attr-defined]

def unwrap(result: ApiResult[T]) -> T:
    if is_success(result):  # type: ignore[arg-type]
        return cast(ApiSuccess[T], result).data
    failure = cast(ApiFailure, result)
    code_part = f" (code {failure.code})" if failure.code else ""
    raise RuntimeError(f"ApiResult failure: {failure.error}{code_part}")

def unwrap_or(result: ApiResult[T], fallback: T) -> T:
    return cast(ApiSuccess[T], result).data if is_success(result) else fallback  # type: ignore[arg-type]

def map_result(result: ApiResult[T], on_success: Callable[[T], U], on_failure: Callable[[ApiFailure], U]) -> U:
    if is_success(result):  # type: ignore[arg-type]
        return on_success(cast(ApiSuccess[T], result).data)
    return on_failure(cast(ApiFailure, result))

def map_success(result: ApiResult[T], fn: Callable[[T], U]) -> ApiResult[U]:
    if is_success(result):  # type: ignore[arg-type]
        suc = cast(ApiSuccess[T], result)
        return ok(fn(suc.data), suc.message)
    return cast(ApiFailure, result)

def map_failure(result: ApiResult[T], fn: Callable[[ApiFailure], ApiFailure]) -> ApiResult[T]:
    if is_failure(result):  # type: ignore[arg-type]
        return fn(cast(ApiFailure, result))
    return result
