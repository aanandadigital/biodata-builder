// checkout.js — GENERIC. Pay -> poll -> done. Same order of operations as
// resume-builder: Razorpay's success callback is a UI signal only; the order
// only really completes once the backend webhook confirms payment server-side.

import { createOrder, pollOrderStatus } from "../api.js";

const AMOUNT_PAISE = window.BIODATA_AMOUNT_PAISE || 1900; // ₹19, adjust to your real price
const CURRENCY = "INR";

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

  overlay.show("Opening payment window…");

  const rzp = new Razorpay({
    key: order.razorpay_key_id,
    order_id: order.razorpay_order_id,
    amount: order.amount_paise,
    currency: order.currency,
    name: "BiodataDraft",
    description: "Marriage biodata PDF download",
    prefill: { name: fullName, email, contact: phone },
    handler: function () {
      overlay.show("Payment received. Generating your biodata…");
      pollOrderStatus(order.order_id)
        .then(() => {
          overlay.show(`Done! Your biodata has been emailed to ${email}. Tap anywhere to close.`);
          setTimeout(overlay.hide, 10000);
        })
        .catch(() => {
          overlay.show("Payment went through, but generation is taking longer than expected. We'll email it as soon as it's ready.");
          setTimeout(overlay.hide, 6000);
        });
    },
    modal: { ondismiss: overlay.hide },
    theme: { color: "#8a5a2b" },
  });

  rzp.on("payment.failed", () => overlay.fail("Payment failed or was cancelled. You can try again whenever you're ready."));
  rzp.open();
}