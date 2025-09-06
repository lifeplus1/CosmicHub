"""API routers package export list."""

from .calculations import router as calculations_router  # type: ignore
from .csp import router as csp_router  # type: ignore

# Comment out complex imports temporarily to get server running
# from . import ai  # type: ignore
from . import calculations  # type: ignore
# from . import charts  # type: ignore
# from . import ephemeris  # type: ignore
# from . import presets  # type: ignore
# from . import subscriptions  # type: ignore

# Import stripe router with proper name (file has dash, so use importlib)
# import importlib
# stripe_router_module = importlib.import_module('.stripe-router', package='api.routers')
# stripe_router = stripe_router_module.router

__all__ = [
    "calculations_router",
    "csp_router", 
    # "ai",
    "calculations",
    # "charts",
    # "ephemeris",
    # "presets",
    # "stripe_router",
    # "subscriptions",
]
