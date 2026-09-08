import test from 'node:test';
import assert from 'node:assert/strict';

test('certificate test harness is initialized', () => {
  assert.equal(typeof assert, 'object');
});
