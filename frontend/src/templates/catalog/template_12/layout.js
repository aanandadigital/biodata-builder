// layout.js — template_12 (Extended Family Tree)
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

function stacked(label, value) {
  return `
    <div class="bd12-stacked">
      <div class="bd12-stacked-label">${esc(label)}</div>
      <div class="bd12-stacked-value">${value && value.trim() ? esc(value) : "&nbsp;"}</div>
    </div>`;
}

function sectionTitle(title) {
  return `<h2 class="bd12-section-title">${esc(title)}</h2>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const birth = sections.find((s) => s.id === "birth");
  const education = sections.find((s) => s.id === "education");
  const family = sections.find((s) => s.id === "family");
  const contact = sections.find((s) => s.id === "contact");
  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template12">
      <div class="bd12-name-bar">${esc(formData.fullName) || "&nbsp;"}</div>

      <div class="bd12-columns">
        <div class="bd12-col-left">
          ${sectionTitle(birth?.title)}
          <div class="bd12-section">
            ${(birth?.fields || []).slice(1).map((f) => stacked(f.label, fmt(f, formData[f.id]))).join("")}
          </div>

          ${sectionTitle(education?.title)}
          <div class="bd12-section">
            ${(education?.fields || []).map((f) => stacked(f.label, fmt(f, formData[f.id]))).join("")}
          </div>

          <div class="bd12-photo-wrap">
            ${photoSrc
              ? `<img class="bd12-photo" src="${photoSrc}" alt="Photo" />`
              : `<div class="bd12-photo bd12-photo-placeholder">Photo</div>`}
          </div>
        </div>

        <div class="bd12-col-right">
          ${sectionTitle(family?.title)}
          <div class="bd12-section">
            ${(family?.fields || []).map((f) => stacked(f.label, fmt(f, formData[f.id]))).join("")}
          </div>

          ${sectionTitle(contact?.title)}
          <div class="bd12-section">
            ${(contact?.fields || []).map((f) => stacked(f.label, fmt(f, formData[f.id]))).join("")}
          </div>
        </div>
      </div>
    </div>`;
}