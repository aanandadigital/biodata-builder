// layout.js — template_23 (Split Header Duo)
import { schema } from "./schema.js";

function esc(str) {
  return (str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Formats "date"-type field values (stored as raw YYYY-MM-DD from the date
// input) into a readable form for display, e.g. "12 Apr 1998". Leaves every
// other field type untouched.
function fmt(field, value) {
  if (field.type !== "date" || !value) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function line(label, value) {
  return `<div class="bd23-line"><span class="bd23-label">${esc(label)}:</span> <span class="bd23-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span></div>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const profile = sections.find((s) => s.id === "profile");
  const contact = sections.find((s) => s.id === "contact");
  const personal = sections.find((s) => s.id === "personal");
  const family = sections.find((s) => s.id === "family");
  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template23">
      <div class="bd23-header">
        <div class="bd23-name-panel">
          <div class="bd23-name">${esc(formData.fullName) || "&nbsp;"}</div>
        </div>
        <div class="bd23-photo-wrap">
          ${photoSrc
            ? `<img class="bd23-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd23-photo bd23-photo-placeholder">Photo</div>`}
          <div class="bd23-contact-caption">
            ${formData.contactPrimary ? `<div>&#9742; ${esc(formData.contactPrimary)}</div>` : ""}
            ${formData.contactSecondary ? `<div>&#9993; ${esc(formData.contactSecondary)}</div>` : ""}
          </div>
        </div>
      </div>

      <div class="bd23-body">
        <div class="bd23-col">
          <h3 class="bd23-col-title">${esc(personal?.title)}</h3>
          ${(personal?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join("")}
        </div>
        <div class="bd23-col">
          <h3 class="bd23-col-title">${esc(family?.title)}</h3>
          ${(family?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join("")}
        </div>
      </div>
    </div>`;
}