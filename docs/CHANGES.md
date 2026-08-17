# Backend fixes — Aug 11, 2026

Fixes for 3 of the 4 issues found during the code review. Issue #4
(Railway `DATABASE_URL` mismatch) is a dashboard/config change on your
end, not a code change — see the last section below.

## 1. Presigned download URL — dead code removed, expiry made intentional
**File:** `backend/app/services/storage.py`, `backend/app/routers/downloads.py`

- Deleted the commented-out old version of `get_presigned_download_url`.
- The live function's default is now `120` seconds (2 minutes) — matching
  what was *actually* running, instead of a `6000`s default that was
  silently being overridden at the call site.
- `downloads.py` now calls `get_presigned_download_url(pdf.storage_key)`
  with no magic number — the default lives in one place.
- Added a docstring explaining why 120s is correct: the URL is generated
  fresh per download click and the browser is redirected to it immediately,
  so a short TTL is a deliberate security choice, not an oversight.

**Behavior change:** none. This was already the real behavior; the code
just no longer contradicts itself.

## 2. `DOWNLOAD_LINK_SECRET` — removed (was required but unused)
**Files:** `backend/app/config.py`, `backend/.env.example`, `backend/.env`

- Removed the unused required setting from `Settings`.
- Removed the line from `.env.example` and your local `.env`.
- Left a comment in `config.py` explaining that download-token security
  comes entirely from `secrets.token_urlsafe(32)` randomness
  (`services/storage.py::generate_download_token`).

**⚠️ Action required before deploying:** `pydantic-settings` defaults to
`extra="forbid"` — if Railway's environment still has `DOWNLOAD_LINK_SECRET`
set when this code deploys, the app **will fail to boot** with a
`ValidationError`. Remove that variable from Railway's dashboard at the
same time you deploy this change.

## 3. `schema` field renamed to `schema_snapshot` (Pydantic shadowing)
**Files:** `backend/app/schemas.py`, `backend/app/routers/orders.py`

- `OrderCreateRequest.schema` → `OrderCreateRequest.schema_snapshot`,
  using `Field(alias="schema")` + `model_config = ConfigDict(populate_by_name=True)`.
- Updated the one internal read site in `orders.py`.

**Behavior change:** none for the frontend. The JSON wire format is
unchanged — `frontend/src/api.js` still sends `schema: {...}` in the
request body exactly as before. Only the internal Python attribute name
changed.

## 4. Railway `DATABASE_URL` pointing at the wrong/dead Supabase project
**Not fixed in code — this is a dashboard config issue.**

Every `POST /api/webhook/razorpay` call is failing in production because
Railway's `DATABASE_URL` references a Supabase project
(`postgres.wdlzarlqmhmkpflvijil`) that the pooler can't find, while your
local `.env` points at a different, apparently-current project
(`postgres.ekfvxncxkncqrzkvrekv`). The mismatched logger name in the logs
(`resume_builder` vs. current code's `biodata_builder`) also suggests
Railway is running an older build.

**To fix:**
1. Railway → backend service → Variables → check `DATABASE_URL`.
2. Confirm which Supabase project is actually live today, and point
   `DATABASE_URL` at it.
3. Also remove `DOWNLOAD_LINK_SECRET` from Railway's variables (see #2).
4. Redeploy from current `main` so the running build matches this repo.

## What's in this package
- `backend_fixes.patch` — a git patch of exactly the 6 changed lines/files
  (`config.py`, `schemas.py`, `storage.py`, `downloads.py`, `orders.py`,
  `.env.example`). Apply with `git apply backend_fixes.patch` from the
  repo root, or review by eye — it's short.
- `biodata-builder-backend-fixed.zip` — the full `backend/` folder with
  all fixes applied, ready to drop in or redeploy. `.env` is excluded
  (it has real secrets — keep using your own, just remove the
  `DOWNLOAD_LINK_SECRET` line per #2 above).
