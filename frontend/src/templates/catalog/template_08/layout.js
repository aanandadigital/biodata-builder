// layout.js — template_08 (Sky Blue Faith)
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
    <div class="bd08-row">
      <span class="bd08-label">${esc(label)}:</span>
      <span class="bd08-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span>
    </div>`;
}

function sectionTitle(title) {
  return `<h2 class="bd08-section-title">${esc(title)}</h2>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const personal = sections.find((s) => s.id === "personal");
  const religious = sections.find((s) => s.id === "religious");
  const family = sections.find((s) => s.id === "family");
  const contact = sections.find((s) => s.id === "contact");
  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template08">
      <div class="bd08-emblem">&#10013;</div>

      <div class="bd08-top-row">
        <div class="bd08-top-left">
          ${sectionTitle(personal?.title)}
          <div class="bd08-section bd08-section-single">
            ${(personal?.fields || []).slice(0, 8).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
          </div>
        </div>
        <div class="bd08-photo-wrap">
          ${photoSrc
            ? `<img class="bd08-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd08-photo bd08-photo-placeholder">Photo</div>`}
        </div>
      </div>

      <div class="bd08-section bd08-section-single">
        ${(personal?.fields || []).slice(8).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>

      ${sectionTitle(religious?.title)}
      <div class="bd08-section bd08-section-pair">
        ${(religious?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>

      ${sectionTitle(family?.title)}
      <div class="bd08-section bd08-section-pair">
        ${(family?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>

      ${sectionTitle(contact?.title)}
      <div class="bd08-section bd08-section-pair">
        ${(contact?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>
    </div>`;
}