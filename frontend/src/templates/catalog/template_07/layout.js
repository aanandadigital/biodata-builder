// layout.js — template_07 (Sacred Minimal)
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
    <div class="bd07-row">
      <span class="bd07-label">${esc(label)}</span>
      <span class="bd07-colon">:</span>
      <span class="bd07-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span>
    </div>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const personal = sections.find((s) => s.id === "personal");
  const family = sections.find((s) => s.id === "family");
  const contact = sections.find((s) => s.id === "contact");
  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template07">
      <div class="bd07-emblem">&#10013;</div>
      <div class="bd07-motto">Praise the Lord</div>

      <div class="bd07-top-row">
        <div class="bd07-top-left">
          <h2 class="bd07-section-title">${esc(personal?.title)}</h2>
          <div class="bd07-section">
            ${(personal?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
          </div>
        </div>
        <div class="bd07-photo-wrap">
          ${photoSrc
            ? `<img class="bd07-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd07-photo bd07-photo-placeholder">Photo</div>`}
        </div>
      </div>

      <h2 class="bd07-section-title">${esc(family?.title)}</h2>
      <div class="bd07-section">
        ${(family?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>

      <h2 class="bd07-section-title">${esc(contact?.title)}</h2>
      <div class="bd07-section">
        ${(contact?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>
    </div>`;
}