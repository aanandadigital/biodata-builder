// layout.js — template_11 (Marathi Kuldaivat)
// Pure rendering: (formData) -> HTML string. Independent of every other template.

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

function row(label, value) {
  return `
    <div class="bd11-row">
      <span class="bd11-label">${esc(label)}</span>
      <span class="bd11-colon">:</span>
      <span class="bd11-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span>
    </div>`;
}

function sectionTitle(title) {
  return `<h2 class="bd11-section-title">${esc(title)}</h2>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const personal = sections.find((s) => s.id === "personal");
  const family = sections.find((s) => s.id === "family");
  const contact = sections.find((s) => s.id === "contact");
  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template11">
      <div class="bd11-header">
        <div class="bd11-header-mark">|| श्री गणेशाय नमः ||</div>
      </div>

      <div class="bd11-top-row">
        <div class="bd11-top-left">
          ${sectionTitle(personal?.title)}
          <div class="bd11-section">
            ${(personal?.fields || []).slice(0, 8).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
          </div>
        </div>
        <div class="bd11-photo-wrap">
          ${photoSrc
            ? `<img class="bd11-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd11-photo bd11-photo-placeholder">फोटो</div>`}
        </div>
      </div>

      <div class="bd11-section">
        ${(personal?.fields || []).slice(8).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>

      ${sectionTitle(family?.title)}
      <div class="bd11-section">
        ${(family?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>

      ${sectionTitle(contact?.title)}
      <div class="bd11-section">
        ${(contact?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>
    </div>`;
}