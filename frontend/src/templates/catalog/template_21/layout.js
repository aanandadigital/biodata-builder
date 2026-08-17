// layout.js — template_21 (Vintage Parchment Scroll)
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
  return `<div class="bd21-line"><span class="bd21-label">${esc(label)}:</span><span class="bd21-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span></div>`;
}

function bar(title, innerHtml) {
  return `
    <div class="bd21-section">
      <div class="bd21-bar">${esc(title)}</div>
      <div class="bd21-section-body">${innerHtml}</div>
    </div>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const profile = sections.find((s) => s.id === "profile");
  const personal = sections.find((s) => s.id === "personal");
  const qualification = sections.find((s) => s.id === "qualification");
  const family = sections.find((s) => s.id === "family");
  const address = sections.find((s) => s.id === "address");
  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template21">
      <div class="bd21-page">
        <div class="bd21-photo-col">
          ${photoSrc
            ? `<img class="bd21-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd21-photo bd21-photo-placeholder">Photo</div>`}
        </div>

        <div class="bd21-content">
          ${formData.invocation && formData.invocation.trim() ? `<div class="bd21-invocation">${esc(formData.invocation)}</div>` : ""}
          <div class="bd21-name-banner">
            <div class="bd21-name">${esc(formData.fullName) || "&nbsp;"}</div>
            ${formData.dobDisplay && formData.dobDisplay.trim() ? `<div class="bd21-dob">${esc(formData.dobDisplay)}</div>` : ""}
          </div>

          ${bar(personal?.title, (personal?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join(""))}
          ${bar(qualification?.title, (qualification?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join(""))}
          ${bar(family?.title, (family?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join(""))}
          ${bar(address?.title, (address?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join(""))}
        </div>
      </div>
    </div>`;
}