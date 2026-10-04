#!/usr/bin/env python3
"""
Layer 3 Execution Script: System Health & Configuration Check
Verifies environment setup, file permissions, and directory structure.
"""

import os
import sys
from pathlib import Path

# Add current directory to path for local imports
sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import PROJECT_ROOT, TMP_DIR, load_environment, output_json, get_tmp_path


def main():
    load_environment()

    # Verify critical environment variables
    db_url = os.environ.get("DATABASE_URL")
    jwt_secret = os.environ.get("JWT_SECRET")

    # Verify .tmp directory is writable
    tmp_test_file = get_tmp_path(".health_check_write_test")
    tmp_writable = False
    try:
        tmp_test_file.write_text("ok", encoding="utf-8")
        tmp_writable = tmp_test_file.read_text(encoding="utf-8") == "ok"
        tmp_test_file.unlink(missing_ok=True)
    except Exception as e:
        tmp_writable = False

    status_data = {
        "workspace_root": str(PROJECT_ROOT),
        "tmp_dir": str(TMP_DIR),
        "tmp_writable": tmp_writable,
        "env_configured": {
            "DATABASE_URL": bool(db_url),
            "JWT_SECRET": bool(jwt_secret),
        },
        "all_checks_passed": tmp_writable,
    }

    output_json(status_data, success=tmp_writable, exit_code=0 if tmp_writable else 1)


if __name__ == "__main__":
    main()
