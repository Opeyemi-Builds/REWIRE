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
| POST | `/api/assessments/submit` | Yes | body: `{ scenarioId, selectedAnswer }` — grades the answer, returns instant feedback (correct?, explanation, which skill improved, points), and updates the learner's score/level. One attempt per scenario. |
| GET | `/api/assessments/score` | Yes | Overall fraud-prevention score + per-category skill profile + level |
| GET | `/api/assessments/profile` | Yes | Focused Fraud Prevention Skill Profile (5 skill axes) for the profile screen |
| GET | `/api/assessments/history` | Yes | Past attempts (most recent first) with scenario context |
| GET | `/api/assessments/progress` | Yes | Per-module completion + list of completed module ids |
| POST | `/api/certificates/issue` | Yes | Issues certificate if score ≥ 70% |
| GET | `/api/certificates/me` | Yes | Get your latest certificate |
| GET | `/api/ecobank/eligibility` | Yes | Mocked Ecobank eligibility check |

All protected routes require an `Authorization: Bearer <access_token>` header — the token comes back from `/api/auth/login`.

## Status

- ✅ **Auth** (register/login/me) — fully working against Supabase
- ✅ **Assessment engine** — grades answers, enforces one attempt per scenario, and produces a per-category **Fraud Prevention Skill Profile** (5 skill axes), overall score, learner level, attempt history, and per-module progress
- ✅ **Modules, scenarios, certificates, ecobank** — working against the schema, using placeholder scoring logic (flat 10 pts/correct answer) — tune once real scenario data lands
- 🔲 **AI personalization** (`services/aiService.js`) — mocked response, swap in a real LLM call
- 🔲 **Real Ecobank integration** (`services/ecobankService.js`) — mocked, swap for `/integrations/ecobank/ecobankAdapter.js` once that's ready

## Intentionally not built (protecting MVP scope)

- Password reset flow
- Rate limiting
- Refresh-token handling — Supabase's client SDK (`supabase-js`) handles session refresh automatically on the **frontend**; the frontend dev should use it directly rather than routing refresh through this backend.

## Assessment engine & Skill Profile

Every scenario belongs to one of **five skill categories** — the axes of the Fraud Prevention Skill Profile. `scenarios.category` is constrained to these exact values in `config/schema.sql`, so **content seeded into `scenarios` must use one of them**:

| `category` value | Skill axis (label) |
|---|---|
| `fraud_awareness` | Fraud Awareness |
| `social_engineering` | Social Engineering |
| `digital_safety` | Digital Safety |
| `scenario_analysis` | Scenario Analysis |
| `critical_thinking` | Critical Thinking |

How scoring works (MVP): each correct answer is worth a flat 10 points. `services/scoringService.js` aggregates a learner's attempts into an overall percentage and a per-category breakdown (each axis reported even at 0%), derives a `level` (Beginner → Fraud Aware → Fraud Prevention Learner → Fraud Prevention Analyst), and — on every submitted answer — persists `total_score` and `level` back to the learner's `profiles` row. Certification unlocks at **70%**. Submitting an answer is idempotent per scenario: a second attempt on the same scenario returns `409`.

## Notes on the data layer

Since we're on Supabase/Postgres (not MongoDB, which the original planning doc suggested), `models/*.js` files are small query-wrapper functions around real Postgres tables, not Mongoose schemas. See `config/schema.sql` for the actual table definitions and Row Level Security policies.

