import test from 'node:test';
import assert from 'node:assert/strict';

import { checkFinancialEligibility, getEcobankConfig, isEcobankConfigured } from '../services/ecobankService.js';

test('getEcobankConfig reads values from the current environment', () => {
  process.env.ECOBANK_ENABLED = 'true';
  process.env.ECOBANK_BASE_URL = 'https://example.com';
  process.env.ECOBANK_TIMEOUT_MS = '20000';
  process.env.ECOBANK_TOKEN_TTL_MS = '600000';

  const cfg = getEcobankConfig();

  assert.equal(cfg.enabled, true);
  assert.equal(cfg.baseUrl, 'https://example.com');
  assert.equal(cfg.requestTimeoutMs, 20000);
  assert.equal(cfg.tokenTtlMs, 600000);
});

test('checkFinancialEligibility falls back to score-only mode when Ecobank is not configured', async () => {
  delete process.env.ECOBANK_ENABLED;
  delete process.env.ECOBANK_PATH_AUTH;
  delete process.env.ECOBANK_SUBKEY_AUTH;

  const result = await checkFinancialEligibility({
    userId: 'user-123',
    fraudPreventionScore: 75,
  });

  assert.equal(result.eligible, true);
  assert.equal(result.source, 'rewire-score');
  assert.equal(isEcobankConfigured(), false);
});
