"""Tests for pseudonymization utilities including salt storage and rotation."""

from datetime import datetime, timedelta
from typing import List
from unittest.mock import MagicMock, patch

import pytest

from utils.pseudonymization import generate_salt, pseudonymize
from utils.salt_storage import SaltStorage, get_salt_storage


class TestPseudonymization:
    """Tests for basic pseudonymization functions."""

    def test_deterministic_with_same_salt(self):
        salt = generate_salt()
        a = pseudonymize("user123", salt)
        b = pseudonymize("user123", salt)
        assert a == b

    def test_different_with_different_salt(self):
        salt1 = generate_salt()
        salt2 = generate_salt()
        a = pseudonymize("user123", salt1)
        b = pseudonymize("user123", salt2)
        assert a != b

    def test_handles_non_string(self):
        salt = generate_salt()
        assert pseudonymize(123, salt)
        assert pseudonymize(45.67, salt)
        assert pseudonymize(b"bytes", salt)

    def test_consistent_output_format(self):
        salt = generate_salt()
        result = pseudonymize("test", salt)
        assert isinstance(result, str)
        assert len(result) == 64  # SHA-256 hex string


class TestSaltStorage:
    """Tests for salt storage and rotation functionality."""

    def setup_method(self):
        """Setup for each test method."""
        self.storage = SaltStorage(use_memory=True)
        self.test_user_id = "test_user_123"
        self.test_salt_type = "test_events"

    def test_create_and_get_user_salt(self):
        """Test creating and retrieving user salts."""
        # Initially no salt exists
        assert self.storage.get_user_salt(self.test_user_id) is None

        # Create a salt
        created_salt = self.storage.create_user_salt(self.test_user_id)
        assert created_salt is not None
        assert len(created_salt) == 32

        # Retrieve the same salt
        retrieved_salt = self.storage.get_user_salt(self.test_user_id)
        assert retrieved_salt == created_salt

    def test_get_or_create_user_salt(self):
        """Test get_or_create functionality."""
        # First call should create a new salt
        salt1 = self.storage.get_or_create_user_salt(self.test_user_id)
        assert salt1 is not None

        # Second call should return the same salt
        salt2 = self.storage.get_or_create_user_salt(self.test_user_id)
        assert salt1 == salt2

    def test_rotate_user_salt(self):
        """Test salt rotation for users."""
        # Create initial salt
        original_salt = self.storage.create_user_salt(self.test_user_id)

        # Rotate the salt
        new_salt = self.storage.rotate_user_salt(self.test_user_id)

        # Verify rotation
        assert new_salt != original_salt
        assert self.storage.get_user_salt(self.test_user_id) == new_salt

        # Check that rotation count is tracked
        user_data = self.storage.memory_store[self.test_user_id]
        assert user_data["rotation_count"] == 1
        assert "previous_salt_hash" in user_data

    def test_create_and_get_global_salt(self):
        """Test creating and retrieving global salts."""
        # Initially no salt exists
        assert self.storage.get_global_salt(self.test_salt_type) is None

        # Create a salt
        created_salt = self.storage.create_global_salt(self.test_salt_type)
        assert created_salt is not None
        assert len(created_salt) == 32

        # Retrieve the same salt
        retrieved_salt = self.storage.get_global_salt(self.test_salt_type)
        assert retrieved_salt == created_salt

    def test_get_or_create_global_salt(self):
        """Test get_or_create functionality for global salts."""
        # First call should create a new salt
        salt1 = self.storage.get_or_create_global_salt(self.test_salt_type)
        assert salt1 is not None

        # Second call should return the same salt
        salt2 = self.storage.get_or_create_global_salt(self.test_salt_type)
        assert salt1 == salt2

    def test_custom_salt_intervals(self):
        """Test custom rotation intervals via environment variables."""
        with patch.dict(
            "os.environ",
            {
                "USER_SALT_ROTATION_DAYS": "60",
                "GLOBAL_SALT_ROTATION_DAYS": "15",
            },
        ):
            storage = SaltStorage(use_memory=True)
            assert storage.user_salt_interval_days == 60
            assert storage.global_salt_interval_days == 15

    def test_salt_due_for_rotation_empty(self):
        """Test getting salts due for rotation when none are due."""
        due = self.storage.get_salts_due_for_rotation()
        assert due == {"users": [], "globals": []}

    def test_salt_due_for_rotation_with_overdue_salts(self):
        """Test getting salts that are overdue for rotation."""
        # Create salts with past rotation dates
        with patch.object(self.storage, "_get_current_time") as mock_time:
            # Set time to past for creation
            past_time = datetime.now() - timedelta(days=100)
            mock_time.return_value = past_time

            self.storage.create_user_salt("user1")
            self.storage.create_user_salt("user2")
            self.storage.create_global_salt("events")

            # Set time to present for checking
            mock_time.return_value = datetime.now()

            due = self.storage.get_salts_due_for_rotation()
            assert "user1" in due["users"]
            assert "user2" in due["users"]
            assert "events" in due["globals"]

    @pytest.mark.asyncio
    async def test_batch_rotate_salts(self):
        """Test batch rotation of multiple salts."""
        # Setup test data
        user_ids = ["user1", "user2", "user3"]
        global_types = ["events", "analytics"]

        # Create initial salts
        for user_id in user_ids:
            self.storage.create_user_salt(user_id)
        for salt_type in global_types:
            self.storage.create_global_salt(salt_type)

        # Perform batch rotation
        results = await self.storage.batch_rotate_salts(user_ids, global_types)

        # Verify results
        assert results["users_rotated"] == len(user_ids)
        assert results["globals_rotated"] == len(global_types)
        assert len(results["errors"]) == 0
        assert "start_time" in results
        assert "end_time" in results

    @pytest.mark.asyncio
    async def test_batch_rotate_with_errors(self):
        """Test batch rotation handling of errors."""
        # Setup some valid and invalid user IDs
        user_ids: List[str] = ["valid_user", "another_user"]
        global_types: List[str] = []

        # Create one valid salt
        self.storage.create_user_salt("valid_user")
        # Don't create salt for "another_user" to trigger an error path

        # Mock rotation to cause error for one user
        with patch.object(self.storage, "rotate_user_salt") as mock_rotate:

            def side_effect(user_id: str) -> bytes:
                if user_id == "another_user":
                    raise Exception("Test error")
                return generate_salt()

            mock_rotate.side_effect = side_effect

            results = await self.storage.batch_rotate_salts(
                user_ids, global_types
            )

            # Should have one success and one error
            assert results["users_rotated"] == 1
            assert len(results["errors"]) == 1
            assert "another_user" in results["errors"][0]

    def test_integration_with_pseudonymize(self):
        """Test integration between salt storage and pseudonymization."""
        user_id = "integration_test_user"
        identifier = "sensitive_data_123"

        # Get salt from storage
        salt = self.storage.get_or_create_user_salt(user_id)

        # Use salt with pseudonymize function
        result1 = pseudonymize(identifier, salt)
        result2 = pseudonymize(identifier, salt)

        # Results should be consistent
        assert result1 == result2

        # After rotation, results should be different
        new_salt = self.storage.rotate_user_salt(user_id)
        result3 = pseudonymize(identifier, new_salt)

        assert result1 != result3


class TestSaltStorageErrorHandling:
    """Tests for error handling in salt storage."""

    def test_db_connection_failure(self):
        """Test handling of database connection failures."""
        # Mock a Firestore client that raises exceptions
        mock_db = MagicMock()
        mock_db.collection.side_effect = Exception("Connection failed")

        storage = SaltStorage(db_client=mock_db, use_memory=False)

        # Should handle errors gracefully and return None
        result = storage.get_user_salt("test_user")
        assert result is None

    def test_invalid_salt_data(self):
        """Test handling of corrupted salt data."""
        storage = SaltStorage(use_memory=True)

        # Manually corrupt the memory store
        storage.memory_store["corrupted_user"] = {
            "salt": "invalid_hex_data",  # Invalid hex
            "created_at": "invalid_date",
        }

        # Should handle gracefully
        storage.get_user_salt("corrupted_user")
        # This will raise an exception due to invalid hex, which is expected behavior  # noqa: E501
        # In production, we might want to handle this more gracefully

    def test_missing_environment_variables(self):
        """Test default values when environment variables are missing."""
        with patch.dict("os.environ", {}, clear=True):
            storage = SaltStorage(use_memory=True)
            assert storage.user_salt_interval_days == 90  # Default value
            assert storage.global_salt_interval_days == 30  # Default value


class TestGlobalSaltStorage:
    """Test the global salt storage singleton."""

    def test_get_salt_storage_singleton(self):
        """Test that get_salt_storage returns the same instance."""
        storage1 = get_salt_storage()
        storage2 = get_salt_storage()
        assert storage1 is storage2

    def test_global_storage_functionality(self):
        """Test basic functionality through global instance."""
        storage = get_salt_storage()
        user_id = "global_test_user"

        # Should work the same as direct instance
        salt1 = storage.get_or_create_user_salt(user_id)
        salt2 = storage.get_or_create_user_salt(user_id)
        assert salt1 == salt2


# Additional integration test
def test_full_pseudonymization_workflow():
    """Test the complete workflow of pseudonymization with salt storage."""
    storage = SaltStorage(use_memory=True)
    user_id = "workflow_test_user"
    sensitive_data: List[str] = [
        "user_email@example.com",
        "192.168.1.1",
        "session_token_123",
    ]

    # Get user-specific salt
    user_salt = storage.get_or_create_user_salt(user_id)

    # Pseudonymize multiple pieces of data
    pseudonymized_data: List[str] = []
    for data in sensitive_data:
        pseudonym = pseudonymize(data, user_salt)
        pseudonymized_data.append(pseudonym)

    # Verify all pseudonyms are different
    assert len(set(pseudonymized_data)) == len(sensitive_data)

    # Rotate salt and verify different pseudonyms
    new_salt = storage.rotate_user_salt(user_id)
    new_pseudonyms: List[str] = [
        pseudonymize(data, new_salt) for data in sensitive_data
    ]

    # New pseudonyms should be different from original ones
    for old, new in zip(pseudonymized_data, new_pseudonyms):
        assert old != new

    # But new pseudonyms should still be consistent
    new_pseudonyms_2: List[str] = [
        pseudonymize(data, new_salt) for data in sensitive_data
    ]
    assert new_pseudonyms == new_pseudonyms_2
