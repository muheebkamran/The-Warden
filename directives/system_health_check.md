# Directive: System Health & Environment Check

## 1. Objective
Verify workspace setup, temporary scratch directories, and environment variable configuration to ensure deterministic tools can run reliably.

## 2. Inputs & Prerequisites
- Optional: `.env` file present in project root.
- Python 3.10+ installed.

## 3. Tools & Scripts
- `execution/health_check.py`: Inspects environment variables, verifies `.tmp/` scratch directory readability and writability, and outputs structured JSON.

## 4. Execution Steps (SOP)
1. **Run Check**:
   Execute the health check script:
   ```bash
   python execution/health_check.py
   ```
2. **Review Output**:
   - Verify `tmp_writable` is `true`.
   - Inspect `env_configured` to see if `.env` keys (`DATABASE_URL`, `JWT_SECRET`) are detected.
3. **Handle Edge Cases**:
   - If `tmp_writable` is `false`, check OS folder permissions for `.tmp/`.
   - If required `.env` variables are missing, ensure `.env` is initialized from `.env.example`.

## 5. Outputs & Deliverables
- **Deliverables**: Formatted status output to stdout/chat for the operator.
- **Intermediate Files**: `.tmp/.health_check_write_test` (automatically created and cleaned up).

## 6. Edge Cases & Learnings (Self-Annealing)
- Windows path resolution: Ensure `pathlib.Path` is used across all scripts in `execution/` to maintain cross-platform compatibility.
