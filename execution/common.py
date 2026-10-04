"""
Common helpers for Layer 3 execution scripts.
"""

from pathlib import Path
import json
import sys
import os

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = PROJECT_ROOT / ".tmp"
DIRECTIVES_DIR = PROJECT_ROOT / "directives"

# Ensure .tmp exists
TMP_DIR.mkdir(parents=True, exist_ok=True)


def load_environment():
    """Load .env file from project root if python-dotenv is installed."""
    try:
        from dotenv import load_dotenv
        env_file = PROJECT_ROOT / ".env"
        if env_file.exists():
            load_dotenv(dotenv_path=env_file)
    except ImportError:
        pass


def get_tmp_path(filename: str) -> Path:
    """Return a path within the .tmp directory."""
    return TMP_DIR / filename


def output_json(data: dict, success: bool = True, exit_code: int = 0):
    """Print structured JSON output and exit cleanly."""
    payload = {
        "success": success,
        "data": data if success else None,
        "error": None if success else data,
    }
    print(json.dumps(payload, indent=2))
    sys.exit(exit_code)
