// layout.js — template_06 (Blossom Pink)
// Pure rendering: (formData) -> HTML string for the live preview / print sheet.
// Knows nothing about other templates. Styling comes entirely from style.css.

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
    <div class="bd06-row">
      <span class="bd06-label">${esc(label)}</span>
      <span class="bd06-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span>
    </div>`;
}

function sectionTitle(title) {
  return `<h2 class="bd06-section-title">${esc(title)}</h2>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const personal = sections.find((s) => s.id === "personal");
  const religious = sections.find((s) => s.id === "religious");
  const family = sections.find((s) => s.id === "family");
  const contact = sections.find((s) => s.id === "contact");
  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template06">
      <div class="bd06-icon">&#9789;</div>
      <div class="bd06-invocation">Bismillah-ir-Rahman-ir-Rahim</div>

      <div class="bd06-top-row">
        <div class="bd06-top-left">
          ${sectionTitle(personal?.title)}
          <div class="bd06-section-single">
            ${(personal?.fields || []).slice(0, 8).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
          </div>
        </div>
        <div class="bd06-photo-wrap">
          ${photoSrc
            ? `<img class="bd06-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd06-photo bd06-photo-placeholder">Photo</div>`}
        </div>
      </div>

      <div class="bd06-section-single">
        ${(personal?.fields || []).slice(8).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>

      ${sectionTitle(religious?.title)}
      <div class="bd06-section-pair">
        ${(religious?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>

      ${sectionTitle(family?.title)}
      <div class="bd06-section-pair">
        ${(family?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>

      ${sectionTitle(contact?.title)}
      <div class="bd06-section-pair">
        ${(contact?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>
    </div>`;
}