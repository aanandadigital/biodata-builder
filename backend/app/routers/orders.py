# app/routers/orders.py
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Order, OrderStatus
from app.schemas import (
    OrderCreateRequest,
    OrderCreateResponse,
    OrderStatusResponse,
)
from app.services.payment import create_razorpay_order, fetch_order_payments, PaymentOrderError
from app.services.pdf_pipeline import generate_and_deliver_pdf
from app.templates_registry import VALID_TEMPLATE_IDS

router = APIRouter(prefix="/api", tags=["orders"])
settings = get_settings()
logger = logging.getLogger("biodata_builder")


@router.post("/create-order", response_model=OrderCreateResponse)
def create_order(payload: OrderCreateRequest, db: Session = Depends(get_db)):
    """
    Creates a pending Order with a snapshot of the biodata form data (and
    the live schema, if the client sent one), then creates a matching
    Razorpay order. The frontend uses the returned razorpay_order_id to
    open Razorpay's checkout widget — actual payment confirmation only
    ever comes from the webhook, never from this endpoint or anything the
    client reports back.

    Price is intentionally NOT taken from the request. It used to be
    (payload.amount_paise), but that let anyone paying via a modified
    frontend, devtools, or a raw curl request set their own price within
    the old ₹1–₹1,000 sanity range. settings.PRODUCT_PRICE_PAISE is the
    single source of truth for what gets charged; whatever the client
    sends for amount_paise is ignored.
    """
    if payload.template_id not in VALID_TEMPLATE_IDS:
        raise HTTPException(status_code=400, detail="Unknown template_id")

    order = Order(
        id=str(uuid.uuid4()),
        customer_email=payload.customer_email,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        community=payload.community,
        template_id=payload.template_id,
        biodata_data=payload.form_data,
        schema_snapshot=payload.schema_snapshot.model_dump() if payload.schema_snapshot else None,
        amount_paise=settings.PRODUCT_PRICE_PAISE,
        currency=payload.currency,
        status=OrderStatus.PENDING,
    )
    db.add(order)
    db.flush()  # get order.id populated before creating the Razorpay order

    try:
        razorpay_order = create_razorpay_order(
            amount_paise=order.amount_paise,
            currency=order.currency,
            receipt=order.id,
        )
    except Exception:
        db.rollback()
        raise HTTPException(status_code=502, detail="Could not initiate payment. Please try again.")

    order.razorpay_order_id = razorpay_order["id"]
    db.commit()
    db.refresh(order)

    return OrderCreateResponse(
        order_id=order.id,
        razorpay_order_id=order.razorpay_order_id,
        razorpay_key_id=settings.RAZORPAY_KEY_ID,
        amount_paise=order.amount_paise,
        currency=order.currency,
    )


@router.get("/order/{order_id}/status", response_model=OrderStatusResponse)
def get_order_status(order_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Lets the frontend poll after checkout closes, in case the webhook
    hasn't landed yet (Razorpay webhooks are usually near-instant but
    aren't guaranteed synchronous with the checkout redirect).

    Self-healing reconciliation: if the order is still PENDING, the webhook
    may simply never have arrived at all (wrong URL configured in Razorpay's
    dashboard, transient outage, etc — this is exactly what happened in
    production on 21 Aug 2026). Rather than leaving the customer's payment
    stuck forever with no PDF and no automatic recourse, piggyback a direct
    check against Razorpay's own API here — the frontend is already calling
    this endpoint every few seconds right after checkout, so this recovers
    the order without needing a separate cron job or any new infrastructure.
    """
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == OrderStatus.PENDING and order.razorpay_order_id:
        try:
            payments = fetch_order_payments(order.razorpay_order_id)
            captured = next(
                (p for p in payments.get("items", []) if p.get("status") == "captured"),
                None,
            )
        except PaymentOrderError:
            logger.exception("Reconciliation check failed for order %s — will retry on next poll", order.id)
            captured = None

        if captured:
            # Same amount-match safety net as the webhook path (see
            # webhooks.py) — never mark paid on a mismatched amount, even
            # via this fallback route.
            if captured.get("amount") == order.amount_paise:
                order.status = OrderStatus.PAID
                order.razorpay_payment_id = captured.get("id")
                order.paid_at = datetime.now(timezone.utc)
                db.commit()
                db.refresh(order)
                background_tasks.add_task(generate_and_deliver_pdf, order.id)
                logger.warning(
                    "Order %s recovered via status-poll reconciliation — webhook was likely missed (payment_id=%s)",
                    order.id, captured.get("id"),
                )
            else:
                logger.critical(
                    "AMOUNT MISMATCH during status-poll reconciliation on order %s: captured=%s expected=%s (payment_id=%s) — NOT marking as paid",
                    order.id, captured.get("amount"), order.amount_paise, captured.get("id"),
                )

    return OrderStatusResponse(
        order_id=order.id,
        status=order.status,
        created_at=order.created_at,
        paid_at=order.paid_at,
    )