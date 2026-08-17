// layout.js — template_22 (Floral Botanical Sidebar)
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
  return `<div class="bd22-line"><span class="bd22-label">${esc(label)}</span><span class="bd22-colon">:</span><span class="bd22-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span></div>`;
}

function groupTitle(title) {
  return `<h3 class="bd22-group-title">${esc(title)}</h3>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const profile = sections.find((s) => s.id === "profile");
  const personal = sections.find((s) => s.id === "personal");
  const family = sections.find((s) => s.id === "family");
  const qualification = sections.find((s) => s.id === "qualification");
  const contact = sections.find((s) => s.id === "contact");
  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template22">
      <div class="bd22-flourish bd22-flourish-tl"></div>
      <div class="bd22-flourish bd22-flourish-br"></div>

      <div class="bd22-body">
        <div class="bd22-photo-col">
          ${photoSrc
            ? `<img class="bd22-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd22-photo bd22-photo-placeholder">Photo</div>`}
        </div>

        <div class="bd22-content">
          <div class="bd22-name">${esc(formData.fullName) || "&nbsp;"}</div>
          <div class="bd22-rule"></div>

          ${groupTitle(personal?.title)}
          <div class="bd22-group">
            ${(personal?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join("")}
          </div>

          ${groupTitle(family?.title)}
          <div class="bd22-group">
            ${(family?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join("")}
          </div>

          ${groupTitle(qualification?.title)}
          <div class="bd22-group">
            ${(qualification?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join("")}
          </div>

          ${groupTitle(contact?.title)}
          <div class="bd22-group">
            ${(contact?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join("")}
          </div>
        </div>
      </div>
    </div>`;
}