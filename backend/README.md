# REWIRE Backend

Node.js + Express REST API for REWIRE, using Supabase for auth and the database (Postgres).

## Stack

- **Express** — REST API framework (routes → controllers → services → Supabase)
- **Supabase** — Postgres database + built-in authentication (no hand-rolled JWT)
- **ES Modules** (`import`/`export`) throughout, not `require`

## Coming from FastAPI? Rough mapping

| FastAPI | This project |
|---|---|
| `APIRouter` | `routes/*.js` |
| Path operation function | `controllers/*.js` |
| `Depends(get_current_user)` | `middleware/authMiddleware.js` → `requireAuth` |
| Pydantic schema validation | `middleware/validateRequest.js` (lightweight version) |
| Service/business-logic layer | `services/*.js` |
| SQLAlchemy models | `models/*.js` — thin Supabase query wrappers, not a full ORM |
| `app.include_router(x, prefix="/api/x")` | `app.use('/api/x', xRoutes)` in `app.js` |

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your Supabase project's URL + keys (Supabase Dashboard → Project Settings → API).
3. Run `config/schema.sql` in the Supabase SQL editor (Dashboard → SQL Editor → New query) to create the required tables and RLS policies.
4. Start the dev server:
   ```
   npm run dev
   ```
   Runs on `http://localhost:5000` by default (`PORT` in `.env`).

## Endpoints

| Method | Route | Auth? | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account — body: `{ name, email, password }` |
| POST | `/api/auth/login` | No | Log in — body: `{ email, password }`, returns Supabase session incl. `access_token` |
| GET | `/api/auth/me` | Yes | Get current user + profile |
| GET | `/api/modules` | Yes | List all learning modules |
| GET | `/api/modules/:id` | Yes | Get one module |
| GET | `/api/scenarios/module/:moduleId` | Yes | Get scenarios for a module (answers hidden) |
| GET | `/api/scenarios/:id` | Yes | Get one scenario (answer hidden) |
| POST | `/api/assessments/submit` | Yes | body: `{ scenarioId, selectedAnswer }` — instant feedback |
| GET | `/api/assessments/score` | Yes | Overall fraud-prevention score |
| POST | `/api/certificates/issue` | Yes | Issues certificate if score ≥ 70% |
| GET | `/api/certificates/me` | Yes | Get your latest certificate |
| GET | `/api/ecobank/eligibility` | Yes | Mocked Ecobank eligibility check |

All protected routes require an `Authorization: Bearer <access_token>` header — the token comes back from `/api/auth/login`.

## Status

- ✅ **Auth** (register/login/me) — fully working against Supabase
- ✅ **Modules, scenarios, assessments, certificates, ecobank** — working against the schema, using placeholder scoring logic (flat 10 pts/correct answer) — tune once real scenario data lands
- 🔲 **AI personalization** (`services/aiService.js`) — mocked response, swap in a real LLM call
- 🔲 **Real Ecobank integration** (`services/ecobankService.js`) — mocked, swap for `/integrations/ecobank/ecobankAdapter.js` once that's ready

## Intentionally not built (protecting MVP scope)

- Password reset flow
- Rate limiting
- Refresh-token handling — Supabase's client SDK (`supabase-js`) handles session refresh automatically on the **frontend**; the frontend dev should use it directly rather than routing refresh through this backend.

## Notes on the data layer

Since we're on Supabase/Postgres (not MongoDB, which the original planning doc suggested), `models/*.js` files are small query-wrapper functions around real Postgres tables, not Mongoose schemas. See `config/schema.sql` for the actual table definitions and Row Level Security policies.
