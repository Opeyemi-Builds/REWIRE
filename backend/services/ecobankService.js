// Ecobank Developer API integration (Azure APIM portal: apimuat-developer.ecobank.com).
//
// Auth model (from the portal's API description page):
//   - Bearer token authentication: every call needs `Authorization: Bearer <token>`.
//   - Azure APIM subscription key: every call needs `Ocp-Apim-Subscription-Key`.
//   - The request body must carry a `serviceCode` naming the target service.
//   - Access tokens expire after ~5 minutes and are scoped to a single service
//     (a token minted for Bill Payment cannot call Account Enquiry).
//   - Documented products: Authentication, Account Enquiry, Bill Payment.
//
// What is CONFIG (fill from your logged-in sandbox — they are not public):
//   - exact endpoint paths, the serviceCode values, and each product's
//     subscription key. These live in env vars / the SERVICES map below so the
//     real values drop in without code changes. Nothing here is a guessed path
//     presented as verified — unset config makes a call throw a clear error.
//
// No new dependency: uses Node 18+ global fetch.

// ---------------------------------------------------------------------------
// Configuration (from environment)
// ---------------------------------------------------------------------------

export function getEcobankConfig() {
  return {
    enabled: String(process.env.ECOBANK_ENABLED || 'false').toLowerCase() === 'true',
    baseUrl: (process.env.ECOBANK_BASE_URL || 'https://apimuat-developer.ecobank.com').replace(/\/$/, ''),
    requestTimeoutMs: Number(process.env.ECOBANK_TIMEOUT_MS || 15000),
    tokenTtlMs: Number(process.env.ECOBANK_TOKEN_TTL_MS || 5 * 60 * 1000),
    credentials: {
      username: process.env.ECOBANK_USERNAME || '',
      password: process.env.ECOBANK_PASSWORD || '',
      clientId: process.env.ECOBANK_CLIENT_ID || '',
      clientSecret: process.env.ECOBANK_CLIENT_SECRET || '',
    },
    subscriptionKeys: {
      authentication: process.env.ECOBANK_SUBKEY_AUTH || '',
      accountEnquiry: process.env.ECOBANK_SUBKEY_ACCOUNT_ENQUIRY || '',
      billPayment: process.env.ECOBANK_SUBKEY_BILL_PAYMENT || '',
    },
    services: {
      authentication: {
        path: process.env.ECOBANK_PATH_AUTH || '',
        serviceCode: process.env.ECOBANK_SERVICECODE_AUTH || '',
      },
      accountEnquiry: {
        path: process.env.ECOBANK_PATH_ACCOUNT_ENQUIRY || '',
        serviceCode: process.env.ECOBANK_SERVICECODE_ACCOUNT_ENQUIRY || '',
      },
      billPayment: {
        path: process.env.ECOBANK_PATH_BILL_PAYMENT || '',
        serviceCode: process.env.ECOBANK_SERVICECODE_BILL_PAYMENT || '',
      },
    },
  };
}

function getRuntimeEcobankState() {
  const cfg = getEcobankConfig();
  return {
    baseUrl: cfg.baseUrl,
    enabled: cfg.enabled,
    requestTimeoutMs: cfg.requestTimeoutMs,
    tokenTtlMs: cfg.tokenTtlMs,
    credentials: cfg.credentials,
    subscriptionKeys: cfg.subscriptionKeys,
    services: {
      authentication: {
        path: cfg.services.authentication.path,
        serviceCode: cfg.services.authentication.serviceCode,
        subscriptionKey: cfg.subscriptionKeys.authentication,
      },
      accountEnquiry: {
        path: cfg.services.accountEnquiry.path,
        serviceCode: cfg.services.accountEnquiry.serviceCode,
        subscriptionKey: cfg.subscriptionKeys.accountEnquiry,
      },
      billPayment: {
        path: cfg.services.billPayment.path,
        serviceCode: cfg.services.billPayment.serviceCode,
        subscriptionKey: cfg.subscriptionKeys.billPayment,
      },
    },
  };
}

const TOKEN_SKEW_MS = 30 * 1000; // refresh 30s before expiry

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// True when enough config is present to actually reach Ecobank. Lets business
// logic (e.g. eligibility) fall back to a mock in dev without credentials.
export function isEcobankConfigured() {
  const cfg = getEcobankConfig();
  return cfg.enabled && Boolean(cfg.services.authentication.path) && Boolean(cfg.subscriptionKeys.authentication);
}

function ecobankError(message, status = 502, details) {
  return Object.assign(new Error(message), { status, details });
}

function getService(product) {
  const { services, subscriptionKeys } = getRuntimeEcobankState();
  const svc = services[product];
  if (!svc) throw ecobankError(`Unknown Ecobank service: ${product}`, 500);
  if (!svc.path) {
    throw ecobankError(
      `Ecobank service "${product}" has no endpoint path configured (set ECOBANK_PATH_* in .env).`,
      500
    );
  }
  if (!svc.subscriptionKey && !subscriptionKeys[product]) {
    throw ecobankError(
      `Ecobank service "${product}" has no subscription key configured (set ECOBANK_SUBKEY_* in .env).`,
      500
    );
  }
  return { ...svc, subscriptionKey: svc.subscriptionKey || subscriptionKeys[product] };
}

// Low-level HTTP: builds the documented headers, enforces a timeout, and
// normalizes errors/JSON. `subscriptionKey` and `token` are attached when given.
async function ecobankFetch(path, { method = 'POST', body, token, subscriptionKey } = {}) {
  const { baseUrl, requestTimeoutMs } = getRuntimeEcobankState();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
  };
  if (subscriptionKey) headers['Ocp-Apim-Subscription-Key'] = subscriptionKey;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw ecobankError(`Ecobank request timed out after ${requestTimeoutMs}ms`, 504);
    }
    throw ecobankError(`Ecobank request failed: ${err.message}`, 502);
  }
  clearTimeout(timer);

  const raw = await res.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw; // non-JSON response; surface as-is
  }

  if (!res.ok) {
    throw ecobankError(`Ecobank API error (${res.status})`, res.status === 401 ? 401 : 502, data);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Token management (per-service, cached, auto-refreshed)
// ---------------------------------------------------------------------------

const tokenCache = new Map(); // product -> { token, expiresAt }

function extractToken(response) {
  if (!response || typeof response !== 'object') return null;
  // Tolerate the common field names until the exact response shape is confirmed.
  return response.access_token || response.token || response.accessToken || response.bearerToken || null;
}

function extractTtlMs(response, fallbackMs = 5 * 60 * 1000) {
  const seconds = response?.expires_in ?? response?.expiresIn;
  return Number.isFinite(Number(seconds)) ? Number(seconds) * 1000 : fallbackMs;
}

// Mint (or reuse) an access token scoped to `product`. Tokens are cached per
// product because Ecobank scopes them to a single service.
export async function getAccessToken(product) {
  const { tokenTtlMs } = getRuntimeEcobankState();
  const cached = tokenCache.get(product);
  if (cached && cached.expiresAt - TOKEN_SKEW_MS > Date.now()) {
    return cached.token;
  }

  const auth = getService('authentication');
  const runtimeServices = getRuntimeEcobankState().services;
  const target = runtimeServices[product];
  const credentials = getRuntimeEcobankState().credentials;

  // Auth request: send whatever credentials are configured, plus the target
  // service's code so the token is scoped correctly. Confirm exact fields in
  // the portal console and adjust here if needed.
  const body = { serviceCode: target?.serviceCode || auth.serviceCode };
  if (credentials.username) body.username = credentials.username;
  if (credentials.password) body.password = credentials.password;
  if (credentials.clientId) body.clientId = credentials.clientId;
  if (credentials.clientSecret) body.clientSecret = credentials.clientSecret;

  const response = await ecobankFetch(auth.path, {
    method: 'POST',
    body,
    subscriptionKey: auth.subscriptionKey,
  });

  const token = extractToken(response);
  if (!token) {
    throw ecobankError('Ecobank authentication succeeded but no token was found in the response', 502, response);
  }

  tokenCache.set(product, { token, expiresAt: Date.now() + extractTtlMs(response, tokenTtlMs) });
  return token;
}

// ---------------------------------------------------------------------------
// Generic service call + product wrappers
// ---------------------------------------------------------------------------

// Call any configured Ecobank product: gets a scoped token, then POSTs the
// payload (with serviceCode injected) to the product's endpoint. One retry on
// 401 in case the cached token expired between the check and the call.
export async function callService(product, payload = {}) {
  const svc = getService(product);
  const body = { serviceCode: svc.serviceCode, ...payload };

  const send = async () => {
    const token = await getAccessToken(product);
    return ecobankFetch(svc.path, { method: 'POST', body, token, subscriptionKey: svc.subscriptionKey });
  };

  try {
    return await send();
  } catch (err) {
    if (err.status === 401) {
      tokenCache.delete(product); // force a fresh token and retry once
      return send();
    }
    throw err;
  }
}

// Authentication Service — expose token generation directly if a caller needs it.
export async function authenticate(product = 'accountEnquiry') {
  return getAccessToken(product);
}

// Account Enquiry Service — payload fields (e.g. account number) per the portal.
export async function accountEnquiry(payload = {}) {
  return callService('accountEnquiry', payload);
}

// Bill Payment Service — payload fields (biller, amount, etc.) per the portal.
export async function billPayment(payload = {}) {
  return callService('billPayment', payload);
}

// ---------------------------------------------------------------------------
// REWIRE business logic
// ---------------------------------------------------------------------------

// Maps a learner's fraud-prevention score to a financial-safety signal. When
// Ecobank is configured and an account number is supplied, enriches the result
// with a live Account Enquiry; otherwise returns the score-based decision only.
// Keeps the existing GET /api/ecobank/eligibility endpoint working with or
// without live credentials.
export async function checkFinancialEligibility({ userId, fraudPreventionScore, accountNumber } = {}) {
  const eligible = fraudPreventionScore >= 70;

  const result = {
    userId,
    fraudPreventionScore,
    eligible,
    riskTier: eligible ? 'low-risk' : 'needs-review',
    recommendedProduct: eligible ? 'Standard Digital Savings Account' : null,
    source: 'rewire-score', // becomes 'ecobank-account-enquiry' when live data is used
  };

  if (!isEcobankConfigured()) {
    return result;
  }

  if (accountNumber && isEcobankConfigured()) {
    try {
      const account = await accountEnquiry({ accountNumber });
      result.source = 'ecobank-account-enquiry';
      result.account = account;
    } catch (err) {
      // Don't fail the eligibility check if the bank call errors - annotate and
      // fall back to the score-based decision.
      result.ecobankError = err.message;
    }
  }

  return result;
}
