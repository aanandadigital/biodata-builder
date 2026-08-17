// layout.js — template_10 (Modern Narrative)
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

function bullet(label, value) {
  return `<div class="bd10-bullet"><span class="bd10-bullet-label">${esc(label)}:</span> ${value && value.trim() ? esc(value) : "&nbsp;"}</div>`;
}

function card(title, innerHtml) {
  return `
    <div class="bd10-card">
      <h3 class="bd10-card-title">${esc(title)}</h3>
      <div class="bd10-card-body">${innerHtml}</div>
    </div>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const profile = sections.find((s) => s.id === "profile");
  const overview = sections.find((s) => s.id === "overview");
  const aboutMe = sections.find((s) => s.id === "aboutMe");
  const expectations = sections.find((s) => s.id === "expectations");
  const family = sections.find((s) => s.id === "family");
  const beliefs = sections.find((s) => s.id === "beliefs");
  const photoSrc = formData.photo || "";

  const headerLine = [formData.location, formData.email, formData.phone]
    .filter((v) => v && v.trim())
    .join("  |  ");

  return `
    <div class="bd-template bd-template10">
      <div class="bd10-header">
        <div class="bd10-photo-wrap">
          ${photoSrc
            ? `<img class="bd10-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd10-photo bd10-photo-placeholder">Photo</div>`}
        </div>
        <div class="bd10-header-text">
          <div class="bd10-name">${esc(formData.fullName) || "&nbsp;"}</div>
          <div class="bd10-subline">${esc(fmt({ type: "date" }, formData.dob)) || ""}${formData.dob && headerLine ? "  |  " : ""}${headerLine}</div>
          <div class="bd10-subline">${formData.motherTongue ? "Mother Tongue: " + esc(formData.motherTongue) : ""}</div>
        </div>
      </div>

      <div class="bd10-grid">
        ${card(overview?.title, (overview?.fields || []).map((f) => bullet(f.label, fmt(f, formData[f.id]))).join(""))}
        ${card(aboutMe?.title, `<p class="bd10-paragraph">${esc(formData.aboutMe) || "&nbsp;"}</p>`)}
        ${card(expectations?.title, `<p class="bd10-paragraph">${esc(formData.expectations) || "&nbsp;"}</p>`)}
        ${card(family?.title, (family?.fields || []).map((f) => bullet(f.label, fmt(f, formData[f.id]))).join(""))}
        ${card(beliefs?.title, (beliefs?.fields || []).map((f) => bullet(f.label, fmt(f, formData[f.id]))).join(""))}
      </div>
    </div>`;
}