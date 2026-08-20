# app/routers/webhooks.py
import hashlib
import hmac
import json
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.config import get_settings
from app.database import get_db
from app.models import Order, OrderStatus, WebhookEvent
from app.services.pdf_pipeline import generate_and_deliver_pdf

router = APIRouter(prefix="/api/webhook", tags=["webhooks"])
settings = get_settings()
logger = logging.getLogger("biodata_builder")


def _verify_signature(raw_body: bytes, signature_header: str) -> bool:
    """
    Razorpay signs the raw request body with your webhook secret using
    HMAC-SHA256. This MUST run on the raw bytes, before any JSON parsing —
    re-serializing a parsed payload can produce different bytes (key
    ordering, whitespace) and silently break verification, or worse,
    make it accidentally always pass.
    """
    if not signature_header:
        return False

    expected = hmac.new(
        key=settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        msg=raw_body,
        digestmod=hashlib.sha256,
    ).hexdigest()

    # constant-time comparison — a plain == leaks timing info an attacker
    # could theoretically use to brute-force the signature byte by byte.
    return hmac.compare_digest(expected, signature_header)


@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    raw_body = await request.body()
    signature_header = request.headers.get("X-Razorpay-Signature", "")

    signature_valid = _verify_signature(raw_body, signature_header)

    # Parse for logging purposes regardless of validity — but nothing
    # gets acted on unless signature_valid is True.
    try:
        parsed = json.loads(raw_body)
    except json.JSONDecodeError:
        parsed = {}

    event_type = parsed.get("event", "unknown")
    payload = parsed.get("payload", {})
    payment_entity = payload.get("payment", {}).get("entity", {})
    refund_entity = payload.get("refund", {}).get("entity", {})
    dispute_entity = payload.get("dispute", {}).get("entity", {})
    razorpay_event_id = request.headers.get("X-Razorpay-Event-Id")

    # order_id isn't present on every event type — payment.* events carry it
    # directly, but refund.* and payment.dispute.* events only carry the
    # underlying payment_id, so we look the order up via that instead.
    razorpay_order_id = payment_entity.get("order_id")
    razorpay_payment_id = payment_entity.get("id") or refund_entity.get("payment_id") or dispute_entity.get("payment_id")

    # ---- Reject invalid signatures outright ----
    if not signature_valid:
        db.add(WebhookEvent(
            id=str(uuid.uuid4()),
            order_id=None,
            razorpay_event_id=razorpay_event_id,
            event_type=event_type,
            signature_valid=False,
            raw_payload=raw_body.decode("utf-8", errors="replace"),
        ))
        db.commit()
        # 400, not 401/403 — don't hint at what would make it valid
        raise HTTPException(status_code=400, detail="Invalid signature")

    # ---- Idempotency: Razorpay retries webhooks; don't double-process ----
    if razorpay_event_id:
        existing = db.scalar(
            select(WebhookEvent).where(WebhookEvent.razorpay_event_id == razorpay_event_id)
        )
        if existing is not None:
            return {"status": "already_processed"}

    order = None
    if razorpay_order_id:
        order = db.scalar(
            select(Order).where(Order.razorpay_order_id == razorpay_order_id)
        )
    elif razorpay_payment_id:
        # refund.* and payment.dispute.* events don't carry razorpay_order_id
        # directly — fall back to matching on the payment id we already
        # stored on the order when it was captured.
        order = db.scalar(
            select(Order).where(Order.razorpay_payment_id == razorpay_payment_id)
        )

    db.add(WebhookEvent(
        id=str(uuid.uuid4()),
        order_id=order.id if order else None,
        razorpay_event_id=razorpay_event_id,
        event_type=event_type,
        signature_valid=True,
        raw_payload=raw_body.decode("utf-8", errors="replace"),
    ))

    if order is None:
        # Signature was valid but we don't recognize this order — log and
        # move on rather than 500ing, so Razorpay doesn't retry forever.
        db.commit()
        return {"status": "order_not_found"}

    # ---- Only react to the events that mean "money has actually landed" ----
    # Allow a captured payment to recover an order that a PRIOR failed
    # attempt on this same order already marked FAILED — Razorpay lets a
    # user retry within the same checkout session after a failed attempt,
    # so "payment.failed" then "payment.captured" for the same order_id is
    # a normal, expected sequence, not a data integrity problem.
    if event_type == "payment.captured" and order.status in (OrderStatus.PENDING, OrderStatus.FAILED):
        order.status = OrderStatus.PAID
        order.razorpay_payment_id = payment_entity.get("id")
        order.paid_at = datetime.now(timezone.utc)
        db.commit()

        # Kick off PDF generation + email after responding — Razorpay expects
        # a fast 2xx response and will retry on timeout, which would otherwise
        # trigger duplicate PDF generation on a slow render.
        background_tasks.add_task(generate_and_deliver_pdf, order.id)

    elif event_type == "payment.failed" and order.status == OrderStatus.PENDING:
        order.status = OrderStatus.FAILED
        db.commit()

    # ---- Refund confirmed by Razorpay (money actually left your account) ----
    # Fired after an admin calls refund_payment() in services/payment.py, or
    # after a manual refund from the Razorpay dashboard. This is the only
    # place Order.status actually flips to REFUNDED — issuing the refund
    # request alone does not guarantee it, so don't mark this anywhere else.
    elif event_type == "refund.processed":
        order.status = OrderStatus.REFUNDED
        db.commit()
        logger.info("Order %s marked REFUNDED (refund.processed)", order.id)

    # ---- Refund was requested but the bank/UPI side rejected it ----
    # Rare, but needs a human to look at it and retry manually from the
    # Razorpay dashboard — there's no automatic retry here on purpose.
    elif event_type == "refund.failed":
        logger.warning(
            "Refund FAILED for order %s (payment_id=%s) — needs manual follow-up in Razorpay dashboard",
            order.id, razorpay_payment_id,
        )
        db.commit()

    # ---- A chargeback/dispute has been opened against this payment ----
    # Disputes have a tight response deadline set by Razorpay/the card
    # network, so this is logged loudly rather than silently filed away.
    # No automatic status change beyond DISPUTED — refunding or contesting
    # the dispute is a human decision, not something to automate here.
    elif event_type == "payment.dispute.created":
        order.status = OrderStatus.DISPUTED
        db.commit()
        logger.warning(
            "DISPUTE opened for order %s (payment_id=%s) — respond in the Razorpay dashboard before the deadline",
            order.id, razorpay_payment_id,
        )

    else:
        db.commit()

    return {"status": "ok"}