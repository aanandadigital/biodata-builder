# app/services/pdf_pipeline.py
import logging
import uuid

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Order, OrderStatus, GeneratedPdf
from app.services.pdf_generator import generate_biodata_pdf, PdfGenerationError
from app.services.storage import (
    upload_pdf,
    generate_download_token,
    token_expiry_datetime,
    build_download_link,
    StorageError,
)
from app.services.email import send_biodata_ready_email, EmailDeliveryError
from app.config import get_settings

logger = logging.getLogger("biodata_builder")
settings = get_settings()


def generate_and_deliver_pdf(order_id: str) -> None:
    """
    Full pipeline run after a webhook confirms payment:
    render PDF -> upload to storage -> create signed download token ->
    email the link -> mark order COMPLETED (or FAILED on any error).

    Runs as a background task, so it owns its own DB session rather than
    reusing the one from the request that triggered it.
    """
    db: Session = SessionLocal()
    try:
        order = db.get(Order, order_id)
        if order is None:
            logger.error("generate_and_deliver_pdf: order %s not found", order_id)
            return

        if order.status != OrderStatus.PAID:
            logger.warning(
                "generate_and_deliver_pdf: order %s not in PAID state (was %s), skipping",
                order_id, order.status,
            )
            return

        order.status = OrderStatus.GENERATING
        db.commit()

        # ---- 1. Render PDF ----
        try:
            pdf_bytes = generate_biodata_pdf(
                template_id=order.template_id,
                form_data=order.biodata_data,
                schema_snapshot=order.schema_snapshot,
            )
        except PdfGenerationError:
            logger.exception("PDF generation failed for order %s", order_id)
            order.status = OrderStatus.FAILED
            db.commit()
            return

        # ---- 2. Upload to storage ----
        try:
            storage_key = upload_pdf(order_id, pdf_bytes)
        except StorageError:
            logger.exception("PDF upload failed for order %s", order_id)
            order.status = OrderStatus.FAILED
            db.commit()
            return

        # ---- 3. Create signed download token ----
        token = generate_download_token()
        expires_at = token_expiry_datetime()

        generated_pdf = GeneratedPdf(
            id=str(uuid.uuid4()),
            order_id=order.id,
            storage_key=storage_key,
            download_token=token,
            token_expires_at=expires_at,
        )
        db.add(generated_pdf)
        db.commit()

        # ---- 4. Email the link ----
        download_url = build_download_link(settings.BACKEND_URL, token)
        expires_in_minutes = settings.DOWNLOAD_LINK_EXPIRY_MINUTES

        try:
            send_biodata_ready_email(
                to_email=order.customer_email,
                customer_name=order.customer_name,
                download_url=download_url,
                expires_in_minutes=expires_in_minutes,
            )
            generated_pdf.email_sent = True
        except EmailDeliveryError:
            logger.exception("Email send failed for order %s — PDF is ready, flagging for follow-up", order_id)
            # PDF exists and is downloadable even if email failed — don't mark FAILED here,
            # just leave email_sent False so it's visible for manual resend/support follow-up.

        order.status = OrderStatus.COMPLETED
        db.commit()

    except Exception:
        logger.exception("Unexpected error in generate_and_deliver_pdf for order %s", order_id)
        db.rollback()
        try:
            order = db.get(Order, order_id)
            if order:
                order.status = OrderStatus.FAILED
                db.commit()
        except Exception:
            logger.exception("Failed to mark order %s as FAILED after pipeline error", order_id)
    finally:
        db.close()
