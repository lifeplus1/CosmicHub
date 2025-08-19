from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/csp", tags=["csp"])


@router.post("/report")
async def csp_report(request: Request):
    """Accept CSP violation reports (report-only). Future: aggregation & metrics."""
    try:
        _ = await request.json()
    except Exception:
        pass
    return JSONResponse(status_code=204, content=None)
