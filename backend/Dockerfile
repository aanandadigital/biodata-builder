# backend/Dockerfile
#
# IMPORTANT — build context must be the REPO ROOT, not backend/:
#   docker build -f backend/Dockerfile .
# (On Railway/Render: set the service's root/build directory to the repo
# root and point it at this Dockerfile, NOT at backend/.)
#
# This is required because render/render.mjs imports the FRONTEND's own
# layout.js/schema.js/dynamicExtras.js/style.css directly (see that file's
# docstring and app/services/pdf_generator.py) — so the image needs both
# backend/ and frontend/src/templates/ present, at the same relative
# position to each other as in the repo, or the render step can't find them.

FROM python:3.11-slim

# ---------------------------------------------------------------------------
# System dependencies Playwright's Chromium needs to actually launch headless
# in a minimal container. `playwright install --with-deps` normally handles
# this, but pinning apt packages explicitly keeps the image reproducible and
# avoids surprise breakage when Playwright's own dependency list changes.
# ---------------------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# Node.js — needed ONLY to run render/render.mjs, which reuses the
# frontend's template modules to build each biodata's HTML. Node itself
# never launches a browser or touches the network; Playwright (Python side)
# is what actually prints to PDF. Pinned major version 20 (LTS).
# ---------------------------------------------------------------------------
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---------------------------------------------------------------------------
# Tell Playwright to install its browsers inside /app instead of the default
# /root/.cache — the app later runs as a non-root user (appuser), which has
# no access to /root. Installing here means the chown of /app below covers
# the browser binaries too.
# ---------------------------------------------------------------------------
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.cache/ms-playwright

# ---------------------------------------------------------------------------
# Install Python deps first — separate layer so `pip install` is cached
# unless requirements.txt actually changes, keeping rebuilds fast.
# ---------------------------------------------------------------------------
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright's Chromium binary (matches the version pinned in
# requirements.txt — keep playwright's Python package and this browser
# install in sync, or page.pdf() calls can fail at runtime).
RUN playwright install chromium

# ---------------------------------------------------------------------------
# App code — backend goes to /app, frontend's template source goes to
# /frontend, preserving the same "../../frontend" relative hop that
# render/render.mjs uses locally (backend/render/render.mjs -> ../../frontend).
# ---------------------------------------------------------------------------
COPY backend/. /app/
COPY frontend/package.json /frontend/package.json
COPY frontend/src/templates /frontend/src/templates

# Run as a non-root user — Chromium in a sandboxed container behaves better
# unprivileged, and it's good practice generally for anything handling
# payment-adjacent data.
RUN useradd --create-home appuser && chown -R appuser:appuser /app /frontend
USER appuser

EXPOSE 8000

# ---------------------------------------------------------------------------
# Uvicorn as the process manager. --workers 1 is deliberate here: Playwright/
# Chromium instances are memory-heavy, and most PaaS free/starter tiers
# (Railway, Render) give you limited RAM — scale workers only once you've
# checked your plan can actually hold multiple Chromium processes at once.
# ---------------------------------------------------------------------------
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
