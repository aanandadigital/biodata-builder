# app/schemas.py
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models import OrderStatus


# ---------------------------------------------------------------------------
# Biodata form data + schema — these mirror what the frontend's state.js
# holds (state.formData / state.schema), NOT a fixed resume shape. Kept
# loose/dict-based since the field set differs per template and can be
# further mutated at runtime (custom sections, extra pages, extra photos).
# Real structural validation happens against the template's own schema.js
# at render time (render/render.mjs), not here — this layer just makes sure
# we received *something* well-formed enough to store and act on.
# ---------------------------------------------------------------------------

class SchemaSnapshot(BaseModel):
    """
    Mirrors the frontend's `{ id, photos, pages }` schema shape (see
    frontend/src/templates/catalog/*/schema.js and schemaUtils.js). Left
    loose (list[dict]) because pages/sections/fields/photos are nested and
    already validated client-side; this just needs to round-trip faithfully
    to the render step.
    """
    id: str
    photos: list[dict[str, Any]] = Field(default_factory=list)
    pages: list[dict[str, Any]] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

class OrderCreateRequest(BaseModel):
    customer_email: EmailStr
    customer_name: str = Field(min_length=1)
    customer_phone: Optional[str] = None
    community: Optional[str] = None
    template_id: str = Field(min_length=1)
    # Raw { fieldId: value } map — value shapes vary by field type (text,
    # date, or a data: URL / uploaded photo URL for photo fields).
    form_data: dict[str, Any] = Field(default_factory=dict)
    # The live schema at checkout time (may be None for older/simplified
    # clients — render/render.mjs falls back to the template's own
    # schema.js in that case, which just means custom sections/pages/extra
    # photos won't appear in the PDF).
    #
    # Named schema_snapshot (not `schema`) on the Python side — `schema` is
    # a name BaseModel itself defines (a deprecated method pre-v3), so a
    # field with that exact name shadows it and triggers a warning. The
    # `alias="schema"` keeps the wire-format JSON key unchanged — the
    # frontend (frontend/src/api.js) already sends `schema: {...}` in the
    # request body and doesn't need to change.
    schema_snapshot: Optional[SchemaSnapshot] = Field(default=None, alias="schema")
    amount_paise: int = Field(gt=0, description="Amount in smallest currency unit (e.g. paise)")
    currency: str = Field(default="INR", min_length=3, max_length=3)

    model_config = ConfigDict(populate_by_name=True)


class OrderCreateResponse(BaseModel):
    """Returned to the frontend so it can open Razorpay's checkout widget."""
    order_id: str                 # your internal Order.id
    razorpay_order_id: str
    razorpay_key_id: str          # public key, safe to expose to client
    amount_paise: int
    currency: str

    model_config = ConfigDict(from_attributes=True)


class OrderStatusResponse(BaseModel):
    order_id: str
    status: OrderStatus
    created_at: datetime
    paid_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Webhooks (Razorpay payload shape — only the fields you actually use)
# ---------------------------------------------------------------------------

class RazorpayPaymentEntity(BaseModel):
    id: str
    order_id: str
    status: str
    amount: int
    currency: str
    email: Optional[str] = None


class RazorpayWebhookPayload(BaseModel):
    """
    Raw parsed body of a Razorpay webhook. Note: signature verification
    happens on the RAW request bytes before this model is even built —
    see webhooks.py. This model is for reading the payload afterward.
    """
    event: str
    payload: dict[str, Any]

    def payment_entity(self) -> Optional[RazorpayPaymentEntity]:
        entity = self.payload.get("payment", {}).get("entity")
        return RazorpayPaymentEntity(**entity) if entity else None


# ---------------------------------------------------------------------------
# Downloads
# ---------------------------------------------------------------------------

class DownloadLinkResponse(BaseModel):
    download_url: str
    expires_at: datetime


class DownloadTokenPayload(BaseModel):
    """Decoded contents of a signed download token."""
    order_id: str
    pdf_id: str
    expires_at: datetime
