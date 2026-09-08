import test from 'node:test';
import assert from 'node:assert/strict';

test('e2e test harness is initialized', () => {
  assert.equal(typeof test, 'function');
});
