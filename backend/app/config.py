# app/config.py
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---- App ----
    ENV: str = "development"
    # Comma-separated list of allowed CORS origins, e.g.
    # "https://biodata-builder.vercel.app,http://localhost:5500"
    FRONTEND_URL: str = "http://localhost:5500"
    # Base URL of THIS backend (Railway/Render/Fly), used to build links to
    # backend routes like /api/download/{token}. Deliberately separate from
    # FRONTEND_URL — that one is for CORS and may hold multiple origins,
    # which would corrupt a link if reused here.
    BACKEND_URL: str = "http://localhost:8000"

    @property
    def allowed_origins(self) -> list[str]:
        # Origins must never have a trailing slash — browsers never send one
        # in the Origin header, so a mismatch here silently breaks every
        # CORS preflight (manifests as 400 on OPTIONS, request never reaches
        # the route).
        return [origin.strip().rstrip("/") for origin in self.FRONTEND_URL.split(",") if origin.strip()]

    # ---- Database ----
    DATABASE_URL: str

    # ---- Razorpay ----
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str

    # ---- Pricing ----
    # The ONLY place the price is decided. The frontend never gets to set
    # this — it used to send amount_paise in the create-order request, but
    # that meant anyone could tamper with the request (devtools, curl, a
    # modified build) and pay whatever they wanted. Now the client's value
    # is ignored entirely; this is what actually gets charged.
    # Set to 100 (₹1) temporarily in your live .env while smoke-testing the
    # live Razorpay keys, then change it back to your real price (and
    # restart the backend) before sharing the link with real customers.
    PRODUCT_PRICE_PAISE: int = 1900  # ₹19

    # ---- Storage (Supabase / S3-compatible) ----
    STORAGE_BUCKET: str
    STORAGE_ENDPOINT_URL: str
    STORAGE_ACCESS_KEY: str
    STORAGE_SECRET_KEY: str

    # ---- Download links ----
    # Note: there is no DOWNLOAD_LINK_SECRET. Token security comes entirely
    # from secrets.token_urlsafe(32) randomness (see
    # services/storage.py::generate_download_token) — tokens aren't HMAC-
    # signed, so there's nothing here to sign them with.
    DOWNLOAD_LINK_EXPIRY_MINUTES: int = 1440

    # ---- Email (SendGrid) ----
    EMAIL_FROM_ADDRESS: str      # must be a SendGrid Single Sender Verified address
    SENDGRID_API_KEY: str        # read from .env, never hardcoded

    # ---- Rendering ----
    # Path to the Node.js executable used to render templates (see
    # services/pdf_generator.py + render/render.mjs). Almost never needs
    # changing locally; the Dockerfile sets this explicitly in production.
    NODE_BINARY: str = "node"
    # Path to render/render.mjs, resolved relative to this file by default.
    RENDER_SCRIPT_PATH: str | None = None
    # Seconds to allow the Node render step before giving up. Template
    # rendering is pure string-building (no network calls) so this should
    # always be fast; generous ceiling just guards against a hang.
    RENDER_TIMEOUT_SECONDS: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()