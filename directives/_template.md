# Directive: [Task / SOP Name]

## 1. Objective
Brief, concrete summary of what this procedure achieves and why it exists.

## 2. Inputs & Prerequisites
- **Inputs**: (e.g., date ranges, user IDs, file paths)
- **Environment / Secrets**: (e.g., `.env` variables required)
- **Pre-flight Checks**: (e.g., database connection, valid token)

## 3. Tools & Scripts
List deterministic scripts in `execution/` to be used:
- `execution/[script_name].py`: [Brief description of what it does]

## 4. Execution Steps (SOP)
Step-by-step sequential workflow:
1. **Prepare**: Extract or validate inputs.
2. **Process**: Run the deterministic script(s). Intermediates belong in `.tmp/`.
3. **Verify**: Check output status, response codes, or verification assertions.
4. **Deliver**: Place final deliverables in designated cloud/destination endpoints.

## 5. Outputs & Deliverables
- **Deliverables**: (e.g., Google Sheet, database record, API response)
- **Intermediate Files**: (Stored in `.tmp/`, can be safely deleted)

## 6. Edge Cases & Learnings (Self-Annealing)
Document edge cases, rate limits, quirks, and updates learned over time:
- *[Date]*: [Description of learning / fix]
