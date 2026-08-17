// layout.js — template_13 (Chattogram Ornate)
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
    <div class="bd13-row">
      <span class="bd13-label">${esc(label)}</span>
      <span class="bd13-colon">:</span>
      <span class="bd13-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span>
    </div>`;
}

function sectionTitle(title) {
  return `<h2 class="bd13-section-title">${esc(title)}</h2>`;
}

function paragraph(value) {
  return `<p class="bd13-paragraph">${value && value.trim() ? esc(value) : "&nbsp;"}</p>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const personal = sections.find((s) => s.id === "personal");
  const family = sections.find((s) => s.id === "family");
  const expectations = sections.find((s) => s.id === "expectations");
  const contact = sections.find((s) => s.id === "contact");
  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template13">
      <div class="bd13-photo-wrap">
        ${photoSrc
          ? `<img class="bd13-photo" src="${photoSrc}" alt="Photo" />`
          : `<div class="bd13-photo bd13-photo-placeholder">Photo</div>`}
      </div>

      <div class="bd13-two-col">
        <div class="bd13-col">
          ${sectionTitle(personal?.title)}
          <div class="bd13-section">
            ${(personal?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
          </div>

          ${sectionTitle(family?.title)}
          <div class="bd13-section">
            ${(() => {
              const fatherF = family?.fields?.find((f) => f.id === "fatherName");
              const motherF = family?.fields?.find((f) => f.id === "motherName");
              const siblingsF = family?.fields?.find((f) => f.id === "siblingsSummary");
              return `
                ${fatherF ? row(fatherF.label, formData[fatherF.id]) : ""}
                ${motherF ? row(motherF.label, formData[motherF.id]) : ""}
                ${siblingsF ? paragraph(formData[siblingsF.id]) : ""}
              `;
            })()}
          </div>
        </div>

        <div class="bd13-col">
          ${sectionTitle(expectations?.title)}
          <div class="bd13-section">
            ${paragraph(formData.expectations)}
          </div>

          ${sectionTitle(contact?.title)}
          <div class="bd13-section">
            ${(contact?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
          </div>
        </div>
      </div>
    </div>`;
}