/**
 * Core Evaluation Helpers — THE WARDEN
 *
 * Pure functions for commitment and day evaluation.
 * All calculations are server-verified — never trust client computations.
 */

export type CommitmentType = 'duration' | 'quantity' | 'count' | 'binary';
export type CommitmentStatus = 'missed' | 'showed_up' | 'complete';

/**
 * Evaluates a single commitment's status based on type, target, and actual values.
 *
 * For duration/quantity/count:
 *   actual < 0.3 * target  => 'missed'
 *   0.3 * target <= actual < target => 'showed_up'
 *   actual >= target        => 'complete'
 *
 * For binary:
 *   actual > 0 => 'complete', else => 'missed'
 */
export function evaluateCommitment(
  type: CommitmentType,
  target: number,
  actual: number
): CommitmentStatus {
  if (type === 'binary') {
    return actual > 0 ? 'complete' : 'missed';
  }

  // Guard: zero or negative target
  if (target <= 0) {
    return actual > 0 ? 'complete' : 'missed';
  }

  const ratio = actual / target;

  if (ratio >= 1) return 'complete';
  if (ratio >= 0.3) return 'showed_up';
  return 'missed';
}

/**
 * Evaluates whether a day passes the 70% threshold.
 *
 * Positive commitments = count of ('complete' + 'showed_up').
 * Required threshold = Math.ceil(0.70 * totalCommitments).
 *
 * Returns true if positiveCommitments >= required threshold.
 */
export function evaluateDay(
  totalCommitments: number,
  positiveCommitments: number
): boolean {
  if (totalCommitments <= 0) return false;
  const required = Math.ceil(0.70 * totalCommitments);
  return positiveCommitments >= required;
}

/**
 * Calculates the required threshold for a given number of commitments.
 */
export function getRequiredThreshold(totalCommitments: number): number {
  if (totalCommitments <= 0) return 0;
  return Math.ceil(0.70 * totalCommitments);
}
