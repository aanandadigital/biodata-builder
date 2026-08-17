# biodata-builder backend

Ported from the resume-builder backend, with the PDF-rendering layer made
template-aware for the 24-template catalog. See inline comments throughout
for the reasoning; this file is a map + the things you actually need to do
before it runs.

## What changed vs. the resume-builder backend

- **`models.py`**: `resume_data` → `biodata_data`; added `template_id`,
  `community`, `schema_snapshot`, `customer_name`, `customer_phone` on
  `Order`. `GeneratedPdf`/`WebhookEvent`/the order state machine are
  untouched.
- **`routers/webhooks.py`, `routers/downloads.py`, `services/payment.py`**:
  copied unchanged — they were already fully generic (no resume-specific
  fields referenced anywhere in them).
- **`services/storage.py`, `services/email.py`**: field/key renames only
  (`resumes/` → `biodatas/`, nested `contact.fullName` → flat
  `customer_name`).
- **`services/pdf_generator.py`**: rewritten. Instead of one hardcoded
  Jinja2 template, it shells out to `render/render.mjs` (Node), which
  imports **your actual frontend template modules** —
  `frontend/src/templates/catalog/<id>/{layout.js,schema.js,style.css}`
  and `dynamicExtras.js` — directly, not a ported copy. Playwright then
  prints the resulting HTML to PDF, same as before.

## Why reuse the frontend's JS instead of porting to 24 Jinja templates

Your AI tool's read was right that `pdf_generator.py` needed to become
template-aware, but porting 24 hand-built layouts into a second templating
language means:
- 24x the initial work,
- every future template-visual tweak needs to be made *twice* (once in
  `layout.js` for the live preview, once in the Jinja port for the PDF),
  and the two *will* drift apart over time.

Since backend and frontend live in the same repo, `render/render.mjs`
imports `../../frontend/src/templates/...` at render time — zero
duplication, zero drift, and template #25 needs no backend changes at all.
The one deliberate difference from the live preview is the watermark:
`dynamicExtras.js`'s `renderExtras()` now takes an optional
`{ watermark: false }` (default `true`, so the live preview is completely
unaffected) — the backend is the only caller that passes `false`.

**Trade-off you're accepting**: the backend container needs Node.js
installed alongside Python (see Dockerfile), and needs `frontend/src/templates`
present in the image at build time (see below). If you'd rather the backend
have zero dependency on the frontend folder, the alternative is porting to
Jinja after all — happy to do that instead if this coupling turns out to be
a problem for your deploy setup.

## A gap I found and fixed while tracing the data flow

`checkout.js` → `main.js` were sending `formData` to `/api/create-order`
but **never sent the live `schema`** — so any custom section, extra page,
or extra photo a user added at runtime was invisible to the backend, and
would have silently been dropped from the paid PDF. Fixed in:
`frontend/src/main.js`, `frontend/src/components/checkout.js`,
`frontend/src/api.js` (now sends `schema: { id, photos, pages }`
alongside `form_data`). `Order.schema_snapshot` stores it; render.mjs
falls back to the template's own pristine `schema.js` if a client ever
omits it (e.g. an old cached frontend build).

## Local setup

```bash
cd backend
cp .env.example .env    # fill in real values
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
node --version           # need Node 18+; render.mjs uses top-level await / for-await
uvicorn app.main:app --reload
```

`render/render.mjs` resolves the frontend via `../../frontend` relative to
itself — i.e. it expects the repo layout `biodata-builder/{frontend,backend}/`
unchanged. If you ever restructure the repo, set `RENDER_SCRIPT_PATH` and
adjust the relative path inside `render.mjs` accordingly.

## Deploying (Docker)

**Build context must be the repo root, not `backend/`:**

```bash
docker build -f backend/Dockerfile -t biodata-builder-backend .
```

On Railway/Render, this means pointing the service at the **repo root**
with the Dockerfile path set to `backend/Dockerfile` — not "root directory:
backend". The Dockerfile copies `frontend/package.json` and
`frontend/src/templates` into the image (not the whole frontend — no need
to ship `assets/thumbnails` etc. into the backend image).

## Testing the render step in isolation

You can exercise `render.mjs` directly without spinning up the whole API —
useful when debugging a specific template:

```bash
echo '{"templateId":"template_01","formData":{"name":"Test User","dob":"1998-04-12"},"schema":null}' \
  | node backend/render/render.mjs > /tmp/out.html
```

I ran this for `template_01` and `template_16` (including a custom section,
a second page, and an extra photo via a schema snapshot) and confirmed:
field values interpolate correctly, custom sections/pages/photos render,
the watermark is absent, and the photo-editor UI chrome (pencil icon,
resize handle) is hidden. I could **not** test the final Playwright
PDF-conversion step in my sandbox (no network access to download the
Chromium binary) — that code is carried over close to verbatim from your
working resume-builder backend, but run one real end-to-end order through
Razorpay test mode before going live to confirm the PDF comes out looking
right, and check pagination on a template with lots of fields (content can
overflow the fixed 735×1040 page — Chromium will just add a second physical
PDF page mid-section in that case, which is reasonable default behavior but
worth eyeballing).

## Still to decide before going live

- **Pricing per template**: `checkout.js`'s `AMOUNT_PAISE` is currently one
  flat price for all 24 templates. If you want to price them differently,
  that's a `MIN/MAX_AMOUNT_PAISE` + frontend change, not touched here.
- **PDF retention**: `services/storage.py` has an unused `delete_pdf()` —
  wire it into a scheduled job if you want generated PDFs purged after N
  days.
- **Stuck-PENDING reconciliation**: `services/payment.py`'s `fetch_payment()`
  is there for a periodic job that double-checks orders stuck in PENDING in
  case a webhook was ever missed — not wired up to a scheduler yet.
