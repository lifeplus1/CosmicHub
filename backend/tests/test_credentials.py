import json
import os

import pytest
from dotenv import load_dotenv

load_dotenv()


def test_firebase_credentials_loaded():
    """Test Firebase credentials are loaded (skip if not in production environment)"""  # noqa: E501
    creds = os.getenv("FIREBASE_CREDENTIALS")
    if creds is None:
        pytest.skip(
            "FIREBASE_CREDENTIALS not set - skipping in development environment"  # noqa: E501
        )

    creds_json = json.loads(creds)
    assert (
        "project_id" in creds_json
    ), "FIREBASE_CREDENTIALS should contain a project_id."
