// layout.js — template_02 (Vedic Sage)
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
    <div class="bd02-row">
      <span class="bd02-label">${esc(label)}</span>
      <span class="bd02-dots"></span>
      <span class="bd02-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span>
    </div>`;
}

function sectionHeader(title) {
  return `<div class="bd02-section-title"><span class="bd02-bullet">◈</span><span class="bd02-title-text">${esc(title)}</span></div>`;
}

export function render(formData, liveSchema) {
  const sections = (liveSchema || schema).sections;
  const personal = sections.find((s) => s.id === "personal");
  const astro = sections.find((s) => s.id === "astro");
  const family = sections.find((s) => s.id === "family");
  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template02">
      <div class="bd02-corner bd02-corner-tl"></div>
      <div class="bd02-corner bd02-corner-tr"></div>
      <div class="bd02-corner bd02-corner-bl"></div>
      <div class="bd02-corner bd02-corner-br"></div>

      <div class="bd02-flourish">
        <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" stroke="#2f7a44" stroke-width="1.4">
            <path d="M15,15 C15,7 9,4 4,4 C4,10 8,15 15,15Z"/>
            <path d="M15,15 C15,7 21,4 26,4 C26,10 22,15 15,15Z"/>
            <path d="M15,15 C9,15 4,20 4,26 C10,26 15,21 15,15Z"/>
            <path d="M15,15 C21,15 26,20 26,26 C20,26 15,21 15,15Z"/>
          </g>
          <circle cx="15" cy="15" r="2.4" fill="#d4af37"/>
        </svg>
      </div>
      <div class="bd02-invocation">|| श्री गणेशाय नमः ||</div>
      <div class="bd02-title">विवाह-वृत्तपत्रम्</div>
      <div class="bd02-title-rule">❖</div>

      <div class="bd02-photo-wrap">
        <div class="bd02-photo-frame">
          ${photoSrc
            ? `<img class="bd02-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd02-photo bd02-photo-placeholder">Photo</div>`}
        </div>
      </div>

      ${sectionHeader(personal?.title)}
      <div class="bd02-section">
        ${(personal?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>

      ${sectionHeader(astro?.title)}
      <div class="bd02-section">
        ${(astro?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>

      ${sectionHeader(family?.title)}
      <div class="bd02-section">
        ${(family?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
      </div>
    </div>`;
}