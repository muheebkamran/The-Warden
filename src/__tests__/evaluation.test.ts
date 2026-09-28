import { describe, it } from 'node:test';
import assert from 'node:assert';
import { evaluateCommitment, evaluateDay, getRequiredThreshold } from '../lib/evaluation.ts';

describe('Evaluation Lib', () => {
  describe('evaluateCommitment', () => {
    it('Duration: actual=0, target=100 => missed', () => {
      assert.strictEqual(evaluateCommitment('duration', 100, 0), 'missed');
    });

    it('Duration: actual=29, target=100 => missed (< 30%)', () => {
      assert.strictEqual(evaluateCommitment('duration', 100, 29), 'missed');
    });

    it('Duration: actual=30, target=100 => showed_up (= 30%)', () => {
      assert.strictEqual(evaluateCommitment('duration', 100, 30), 'showed_up');
    });

    it('Duration: actual=50, target=100 => showed_up', () => {
      assert.strictEqual(evaluateCommitment('duration', 100, 50), 'showed_up');
    });

    it('Duration: actual=99, target=100 => showed_up', () => {
      assert.strictEqual(evaluateCommitment('duration', 100, 99), 'showed_up');
    });

    it('Duration: actual=100, target=100 => complete', () => {
      assert.strictEqual(evaluateCommitment('duration', 100, 100), 'complete');
    });

    it('Duration: actual=150, target=100 => complete (over target)', () => {
      assert.strictEqual(evaluateCommitment('duration', 100, 150), 'complete');
    });

    it('Binary: actual=1 => complete', () => {
      assert.strictEqual(evaluateCommitment('binary', 1, 1), 'complete');
    });

    it('Binary: actual=0 => missed', () => {
      assert.strictEqual(evaluateCommitment('binary', 1, 0), 'missed');
    });

    it('Quantity: actual=3, target=10 => showed_up', () => {
      assert.strictEqual(evaluateCommitment('quantity', 10, 3), 'showed_up');
    });

    it('Count: actual=2, target=10 => missed', () => {
      assert.strictEqual(evaluateCommitment('count', 10, 2), 'missed');
    });

    it('Zero target: actual=5, target=0 => complete', () => {
      assert.strictEqual(evaluateCommitment('quantity', 0, 5), 'complete');
    });
  });

  describe('evaluateDay', () => {
    it('0 commitments => false', () => {
      assert.strictEqual(evaluateDay(0, 0), false);
    });

    it('1 commitment, 1 positive => true', () => {
      assert.strictEqual(evaluateDay(1, 1), true);
    });

    it('1 commitment, 0 positive => false', () => {
      assert.strictEqual(evaluateDay(1, 0), false);
    });

    it('10 commitments, 7 positive => true', () => {
      assert.strictEqual(evaluateDay(10, 7), true);
    });

    it('10 commitments, 6 positive => false', () => {
      assert.strictEqual(evaluateDay(10, 6), false);
    });

    it('3 commitments, 2 positive => false', () => {
      assert.strictEqual(evaluateDay(3, 2), false);
    });

    it('3 commitments, 3 positive => true', () => {
      assert.strictEqual(evaluateDay(3, 3), true);
    });

    it('5 commitments, 4 positive => true', () => {
      assert.strictEqual(evaluateDay(5, 4), true);
    });

    it('5 commitments, 3 positive => false', () => {
      assert.strictEqual(evaluateDay(5, 3), false);
    });
  });

  describe('getRequiredThreshold', () => {
    it('0 => 0', () => {
      assert.strictEqual(getRequiredThreshold(0), 0);
    });

    it('1 => 1', () => {
      assert.strictEqual(getRequiredThreshold(1), 1);
    });

    it('5 => 4', () => {
      assert.strictEqual(getRequiredThreshold(5), 4);
    });

    it('7 => 5', () => {
      assert.strictEqual(getRequiredThreshold(7), 5);
    });

    it('10 => 7', () => {
      assert.strictEqual(getRequiredThreshold(10), 7);
    });
  });
});
