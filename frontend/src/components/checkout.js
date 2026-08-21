// checkout.js — GENERIC. Pay -> poll -> done. Same order of operations as
// resume-builder: Razorpay's success callback is a UI signal only; the order
// only really completes once the backend webhook (or the status-poll
// reconciliation fallback in the backend — see routers/orders.py) confirms
// payment server-side.

import { createOrder, pollOrderStatus } from "../api.js";

// NOTE: this value is cosmetic only — the backend ignores whatever amount
// the client sends and decides the real price itself from
// settings.PRODUCT_PRICE_PAISE (backend/app/config.py). The Razorpay widget
// below actually opens with `order.amount_paise`, i.e. whatever the server
// returned, not this constant. To change the real price (or test at ₹1 on
// live keys), set PRODUCT_PRICE_PAISE in the backend's .env and restart the
// backend — editing this number alone no longer does anything.
const AMOUNT_PAISE = window.BIODATA_AMOUNT_PAISE || 1900; // ₹19
const CURRENCY = "INR";
const SUPPORT_EMAIL = "aananda.creation@gmail.com";

// ---------------------------------------------------------------------------
// Refresh-safe order tracking.
//
// Bug this fixes: previously, the only thing tracking "which order are we
// waiting on" was a JS variable inside startCheckout()'s closure. If the
// customer refreshed or the tab reloaded right after paying, that variable
// was gone — the page had no idea a payment was in flight, so it never
// resumed polling. The order was actually fine server-side (payment
// captured, row in the DB), but from the customer's screen it looked like
// their money vanished with no feedback and no way to check.
//
// Fix: persist {orderId, email, startedAt} to localStorage the moment an
// order is created, and check for it once on every page load (see
// resumePendingOrderIfAny, wired up in main.js). If found, resume polling
// exactly as if the payment had just completed.
// ---------------------------------------------------------------------------
const PENDING_ORDER_KEY = "biodata-pending-order";
// Don't resume anything older than this — a stale leftover key from a much
// earlier visit (tab left open across days, etc.) shouldn't suddenly pop the
// overlay back up on an unrelated future visit. pollOrderStatus's own 10-min
// timeout is the normal ceiling; this is just a sanity bound on top of it.
const MAX_RESUME_AGE_MS = 15 * 60 * 1000;

function savePendingOrder(orderId, email) {
  try {
    localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({ orderId, email, startedAt: Date.now() }));
  } catch (e) {
    // localStorage unavailable (private browsing, etc.) — refresh-safety is
    // best-effort; the normal in-page flow below still works fine.
  }
}

function clearPendingOrder() {
  try {
    localStorage.removeItem(PENDING_ORDER_KEY);
  } catch (e) {}
}

function getPendingOrder() {
  try {
    const raw = localStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.orderId || Date.now() - parsed.startedAt > MAX_RESUME_AGE_MS) {
      clearPendingOrder();
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

// Shared by both the normal post-payment flow and the refresh-resume flow,
// so the messaging (including the support contact fallback) only lives in
// one place.
function watchOrder(orderId, email, overlay) {
  overlay.show("Payment received. Generating your biodata…");
  pollOrderStatus(orderId)
    .then(() => {
      clearPendingOrder();
      overlay.show(`Done! Your biodata has been emailed to ${email}. Tap anywhere to close.`);
      setTimeout(overlay.hide, 10000);
    })
    .catch((err) => {
      clearPendingOrder();
      if (err?.message === "payment_failed") {
        overlay.fail("Payment failed or was cancelled. You can try again whenever you're ready.");
        return;
      }
      // Timeout or unexpected error: don't leave the customer with a dead
      // end. Give them the order ID and support contact right here, so they
      // don't have to go hunting for the refund policy page.
      overlay.show(
        `Payment went through, but generation is taking longer than expected. ` +
        `We'll email your biodata to ${email} as soon as it's ready. ` +
        `Still nothing after a while? Email ${SUPPORT_EMAIL} with this order ID: ${orderId}`
      );
      setTimeout(overlay.hide, 20000);
    });
}

// Call once on page load (see main.js). If a payment was in flight when the
// page was last closed/refreshed, this resumes tracking it automatically
// instead of leaving the customer with no feedback at all.
export function resumePendingOrderIfAny(overlay) {
  const pending = getPendingOrder();
  if (!pending) return;
  watchOrder(pending.orderId, pending.email, overlay);
}

export async function startCheckout({ email, fullName, phone, community, templateId, formData, schema }, overlay) {
  if (!email) return overlay.fail("Please add your email before downloading.");
  if (!fullName) return overlay.fail("Please add your name before downloading.");
  if (!phone) return overlay.fail("Please add your phone number before downloading.");

  overlay.show("Preparing your order…");

  let order;
  try {
    order = await createOrder({
      email,
      fullName,
      phone,
      community,
      templateId,
      formData,
      schema,
      amountPaise: AMOUNT_PAISE,
      currency: CURRENCY,
    });
  } catch (err) {
    return overlay.fail("Could not start checkout. Please try again in a moment.");
  }

  // Persist BEFORE opening the widget — if the customer pays and then
  // refreshes before the handler below even runs, we still know which order
  // to resume.
  savePendingOrder(order.order_id, email);

  overlay.show("Opening payment window…");

  const rzp = new Razorpay({
    key: order.razorpay_key_id,
    order_id: order.razorpay_order_id,
    amount: order.amount_paise,
    currency: order.currency,
    name: "Aananda Digital",
    description: "Marriage biodata PDF download",
    prefill: { name: fullName, email, contact: phone },
    handler: function () {
      watchOrder(order.order_id, email, overlay);
    },
    modal: {
      ondismiss: () => {
        // Customer closed the widget without paying — nothing to resume.
        clearPendingOrder();
        overlay.hide();
      },
    },
    theme: { color: "#8a5a2b" },
  });

  rzp.on("payment.failed", () => {
    clearPendingOrder();
    overlay.fail("Payment failed or was cancelled. You can try again whenever you're ready.");
  });
  rzp.open();
}