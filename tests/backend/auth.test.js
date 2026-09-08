import test from 'node:test';
import assert from 'node:assert/strict';

test('backend test harness is initialized', () => {
  assert.equal(typeof test, 'function');
});
