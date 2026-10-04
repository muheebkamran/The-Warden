# Layer 3: Execution Scripts

This directory contains deterministic Python scripts that carry out discrete tasks defined by SOP directives.

## Principles

1. **Deterministic & Testable**: Scripts should produce consistent outputs for given inputs. Avoid non-deterministic logic here.
2. **Configuration via `.env`**: Secrets, API tokens, and connection strings are read from `.env` (or environment variables).
3. **Structured I/O**: Scripts should accept CLI arguments and output clear results (stdout / JSON) and exit with code 0 on success, non-zero on failure.
4. **Intermediate Files**: Any temporary downloads, scraped pages, or staged data must be written to `.tmp/`.
5. **Self-Annealing**: When an execution script fails due to an API change or unexpected format, fix the script, verify it, and document the update in the corresponding directive in `directives/`.

## Shared Utilities

- `execution/common.py`: Shared utilities for path resolution (root, `.tmp`), environment loading, and structured output.
