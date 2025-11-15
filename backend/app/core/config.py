from functools import lru_cache
import os
from pathlib import Path

from pydantic import BaseModel


def load_env_file(path: str = ".env") -> None:
    env_path = Path(path)
    if not env_path.exists():
        return

    for raw_line in env_path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


load_env_file()


class Settings(BaseModel):
    app_name: str = os.getenv("APP_NAME", "Mini Ledger")
    environment: str = os.getenv("ENVIRONMENT", "local")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///ledger.db")
    database_echo: bool = os.getenv("DB_ECHO", "0") == "1"
    auto_create_tables: bool = os.getenv("AUTO_CREATE_TABLES", "0") == "1"
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,"
            "https://localhost:5173,https://127.0.0.1:5173,"
            "http://localhost:4173,http://127.0.0.1:4173,"
            "https://localhost:4173,https://127.0.0.1:4173",
        ).split(",")
        if origin.strip()
    ]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
