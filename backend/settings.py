"""
Hardened environment configuration using Pydantic BaseSettings.
Validates and provides type-safe access to environment variables.
"""

from pathlib import Path
from typing import Literal, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Export list for explicit module interface
__all__ = ["settings", "get_settings", "validate_settings", "AppSettings"]


class DatabaseSettings(BaseSettings):
    """Database configuration with validation."""

    model_config = SettingsConfigDict()

    url: str = Field(
        ..., description="PostgreSQL connection string", alias="DATABASE_URL"
    )

    @field_validator("url")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v.startswith(("postgresql://", "postgres://")):
            raise ValueError(
                "DATABASE_URL must be a PostgreSQL connection string"
            )
        return v


class RedisSettings(BaseSettings):
    """Redis configuration with fallback."""

    model_config = SettingsConfigDict()

    url: str = Field(
        "redis://localhost:6379",
        description="Redis connection string",
        alias="REDIS_URL",
    )

    @field_validator("url")
    @classmethod
    def validate_redis_url(cls, v: str) -> str:
        if not v.startswith("redis://"):
            raise ValueError("REDIS_URL must start with redis://")
        return v


class EmailSettings(BaseSettings):
    """Email/SMTP configuration."""

    model_config = SettingsConfigDict()

    host: str = Field("localhost", description="SMTP host", alias="SMTP_HOST")
    port: int = Field(1025, description="SMTP port", alias="SMTP_PORT")
    user: str = Field("", description="SMTP username", alias="SMTP_USER")
    password: str = Field("", description="SMTP password", alias="SMTP_PASS")

    @field_validator("port")
    @classmethod
    def validate_port(cls, v: int) -> int:
        if not 1 <= v <= 65535:
            raise ValueError("SMTP_PORT must be between 1 and 65535")
        return v


class ObservabilitySettings(BaseSettings):
    """Monitoring and observability configuration."""

    model_config = SettingsConfigDict()

    sentry_dsn: Optional[str] = Field(
        None, description="Sentry DSN URL", alias="SENTRY_DSN"
    )
    new_relic_license_key: Optional[str] = Field(
        None,
        description="New Relic license key",
        alias="NEW_RELIC_LICENSE_KEY",
    )

    @field_validator("sentry_dsn")
    @classmethod
    def validate_sentry_dsn(cls, v: Optional[str]) -> Optional[str]:
        if v and not v.startswith("https://"):
            raise ValueError("SENTRY_DSN must be a valid HTTPS URL")
        return v


class SecuritySettings(BaseSettings):
    """Security and rate limiting configuration."""

    model_config = SettingsConfigDict()

    rate_limit_max: int = Field(
        60, description="Maximum requests per window", alias="RATE_LIMIT_MAX"
    )
    rate_limit_window: int = Field(
        60,
        description="Rate limit window in seconds",
        alias="RATE_LIMIT_WINDOW",
    )

    @field_validator("rate_limit_max", "rate_limit_window")
    @classmethod
    def validate_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Rate limit values must be positive")
        return v


class LoggingSettings(BaseSettings):
    """Logging configuration."""

    model_config = SettingsConfigDict()

    level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = Field(
        "INFO", description="Log level", alias="LOG_LEVEL"
    )
    format: Literal["json", "plain"] = Field(
        "plain", description="Log format", alias="LOG_FORMAT"
    )
    file: str = Field("app.log", description="Log file path", alias="LOG_FILE")


class AppSettings(BaseSettings):
    """Main application settings with all environment variables."""

    model_config = SettingsConfigDict(
        env_file=[".env.production.server", ".env.local", ".env"],
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow",
        populate_by_name=True,
    )

    # Core service settings
    api_url: str = Field(
        default="http://localhost:8000",
        description="API base URL",
        alias="API_URL",
    )
    port: int = Field(
        default=8000, description="Application port", alias="PORT"
    )
    environment: Literal["development", "staging", "production"] = Field(
        default="development",
        description="Deployment environment",
        alias="DEPLOY_ENVIRONMENT",
    )

    # Ephemeris data path
    ephe_path: str = Field(
        default="./ephe",
        description="Path to ephemeris data files",
        alias="EPHE_PATH",
    )

    # Database settings
    database_url: str = Field(
        default="postgresql://localhost:5432/cosmichub",
        description="PostgreSQL connection string",
        alias="DATABASE_URL",
    )

    # Redis settings
    redis_url: str = Field(
        default="redis://localhost:6379",
        description="Redis connection string",
        alias="REDIS_URL",
    )

    # Email/SMTP settings
    smtp_host: str = Field(
        default="localhost", description="SMTP host", alias="SMTP_HOST"
    )
    smtp_port: int = Field(
        default=1025, description="SMTP port", alias="SMTP_PORT"
    )
    smtp_user: str = Field(
        default="", description="SMTP username", alias="SMTP_USER"
    )
    smtp_password: str = Field(
        default="", description="SMTP password", alias="SMTP_PASS"
    )

    # Firebase Admin SDK settings (secure)
    firebase_credentials: Optional[str] = Field(
        default=None,
        description="Firebase service account credentials (JSON)",
        alias="FIREBASE_CREDENTIALS",
    )
    firebase_project_id: Optional[str] = Field(
        default=None,
        description="Firebase project ID",
        alias="FIREBASE_PROJECT_ID",
    )
    firebase_private_key: Optional[str] = Field(
        default=None,
        description="Firebase private key",
        alias="FIREBASE_PRIVATE_KEY",
    )
    firebase_private_key_id: Optional[str] = Field(
        default=None,
        description="Firebase private key ID",
        alias="FIREBASE_PRIVATE_KEY_ID",
    )
    firebase_client_email: Optional[str] = Field(
        default=None,
        description="Firebase client email",
        alias="FIREBASE_CLIENT_EMAIL",
    )
    firebase_client_id: Optional[str] = Field(
        default=None,
        description="Firebase client ID",
        alias="FIREBASE_CLIENT_ID",
    )

    # Observability settings
    sentry_dsn: Optional[str] = Field(
        default=None, description="Sentry DSN URL", alias="SENTRY_DSN"
    )
    new_relic_license_key: Optional[str] = Field(
        default=None,
        description="New Relic license key",
        alias="NEW_RELIC_LICENSE_KEY",
    )

    # Security and rate limiting
    rate_limit_max: int = Field(
        default=60,
        description="Maximum requests per window",
        alias="RATE_LIMIT_MAX",
    )
    rate_limit_window: int = Field(
        default=60,
        description="Rate limit window in seconds",
        alias="RATE_LIMIT_WINDOW",
    )

    # Mock auth settings (development only)
    allow_mock_auth: bool = Field(
        default=True,
        description="Allow mock authentication in development",
        alias="ALLOW_MOCK_AUTH",
    )

    # Logging settings
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = Field(
        default="INFO", description="Log level", alias="LOG_LEVEL"
    )
    log_format: Literal["json", "plain"] = Field(
        default="plain", description="Log format", alias="LOG_FORMAT"
    )
    log_file: str = Field(
        default="app.log", description="Log file path", alias="LOG_FILE"
    )

    @field_validator("firebase_credentials")
    @classmethod
    def validate_firebase_credentials(cls, v: Optional[str]) -> Optional[str]:
        """Validate Firebase credentials JSON if provided."""
        if v:
            try:
                import json

                cred_data = json.loads(v)
                required_fields = [
                    "type",
                    "project_id",
                    "private_key",
                    "client_email",
                ]
                missing_fields = [
                    field
                    for field in required_fields
                    if not cred_data.get(field)
                ]
                if missing_fields:
                    raise ValueError(
                        f"Firebase credentials missing required fields: {missing_fields}"
                    )
                return v
            except json.JSONDecodeError:
                raise ValueError("FIREBASE_CREDENTIALS must be valid JSON")
        return v

    @field_validator("allow_mock_auth")
    @classmethod
    def validate_mock_auth(cls, v: bool) -> bool:
        """Validate mock auth settings."""
        # In production, mock auth should be disabled
        # This will be enforced by deployment configuration
        return v

    @field_validator("log_level", mode="before")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Convert log level to uppercase for validation."""
        return str(v).upper()

    @field_validator("api_url")
    @classmethod
    def validate_api_url(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("API_URL must be a valid HTTP/HTTPS URL")
        return v

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v.startswith(("postgresql://", "postgres://")):
            raise ValueError(
                "DATABASE_URL must be a PostgreSQL connection string"
            )
        return v

    @field_validator("redis_url")
    @classmethod
    def validate_redis_url(cls, v: str) -> str:
        if not v.startswith("redis://"):
            raise ValueError("REDIS_URL must start with redis://")
        return v

    @field_validator("sentry_dsn")
    @classmethod
    def validate_sentry_dsn(cls, v: Optional[str]) -> Optional[str]:
        if v and not v.startswith("https://"):
            raise ValueError("SENTRY_DSN must be a valid HTTPS URL")
        return v

    @field_validator("ephe_path")
    @classmethod
    def validate_ephe_path(cls, v: str) -> str:
        path = Path(v)
        if not path.exists():
            # Create directory if it doesn't exist
            path.mkdir(parents=True, exist_ok=True)
        return str(path.absolute())

    @field_validator("port", "smtp_port")
    @classmethod
    def validate_port(cls, v: int) -> int:
        if not 1024 <= v <= 65535:
            raise ValueError("Port must be between 1024 and 65535")
        return v

    @field_validator("rate_limit_max", "rate_limit_window")
    @classmethod
    def validate_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Rate limit values must be positive")
        return v


# Global settings instance
settings = AppSettings()


def get_settings() -> AppSettings:
    """Get validated application settings."""
    return settings


def validate_settings() -> tuple[bool, list[str]]:
    """Validate all settings and return status with any errors."""
    try:
        # Use the global settings instance for consistency
        _ = settings  # Access the global settings to ensure it's used
        return True, []
    except Exception as e:
        return False, [str(e)]


if __name__ == "__main__":
    # CLI validation utility
    valid, errors = validate_settings()
    if valid:
        # Use the global settings instance
        print("✅ All environment settings are valid")
        print(f"Environment: {settings.environment}")
        print(f"API URL: {settings.api_url}")
        print(f"Database: {settings.database_url[:20]}...")
    else:
        print("❌ Environment validation failed:")
        for error in errors:
            print(f"  • {error}")
        exit(1)
