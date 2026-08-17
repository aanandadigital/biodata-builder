// api.js — talks to the backend. Same pattern as resume-builder:
// create an order first, pay, then poll status until the server-side
// webhook has generated and emailed the PDF. Nothing here is template-specific.

const API_BASE = window.BIODATA_API_BASE || "";

export async function createOrder({ email, fullName, phone, community, templateId, formData, schema, amountPaise, currency }) {
  const res = await fetch(`${API_BASE}/api/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_email: email,
      customer_name: fullName,
      customer_phone: phone,
      community,
      template_id: templateId,
      form_data: formData,
      // Live schema shape (pages/sections/photos, including anything the
      // user added/removed) — the backend renders the PDF from this, not
      // just the template's original schema.js.
      schema: schema ? { id: schema.id, photos: schema.photos, pages: schema.pages } : null,
      amount_paise: amountPaise,
      currency,
    }),
  });
  if (!res.ok) throw new Error("create-order failed");
  return res.json();
}

export async function getOrderStatus(orderId) {
  const res = await fetch(`${API_BASE}/api/order/${orderId}/status`);
  if (!res.ok) throw new Error("status check failed");
  return res.json();
}

export function pollOrderStatus(orderId, { intervalMs = 2000, timeoutMs = 600000 } = {}) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      if (Date.now() - startedAt > timeoutMs) return reject(new Error("timeout"));
      try {
        const data = await getOrderStatus(orderId);
        if (data.status === "completed") return resolve(data);
        if (data.status === "failed") return reject(new Error("payment_failed"));
        setTimeout(tick, intervalMs);
      } catch (err) {
        setTimeout(tick, intervalMs);
      }
    };
    tick();
  });
}
