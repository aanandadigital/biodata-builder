// layout.js — template_17 (Noir Portrait Editorial)
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

const ICONS = {
  personalHighlight: "&#9679;",
  familyHighlight: "&#9873;",
  careerHighlight: "&#9873;",
  beliefsHighlight: "&#9825;",
};

function fieldVal(formData, field) {
  return field ? fmt(field, (formData[field.id] || "").toString().trim()) : "";
}

function highlightRow(formData, section, icon) {
  const [f1, f2, note] = (section?.fields || []);
  const v1 = fieldVal(formData, f1);
  const v2 = fieldVal(formData, f2);
  const vNote = fieldVal(formData, note);
  return `
    <div class="bd17-highlight">
      <div class="bd17-highlight-icon">${icon}</div>
      <div class="bd17-highlight-body">
        <div class="bd17-highlight-title">${esc(section?.title)}</div>
        <div class="bd17-highlight-text">
          ${v1 ? `<span>${esc(f1.label)}: ${esc(v1)}</span>` : ""}
          ${v2 ? `<span>${esc(f2.label)}: ${esc(v2)}</span>` : ""}
          ${vNote ? `<span class="bd17-note">${esc(vNote)}</span>` : ""}
        </div>
      </div>
    </div>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const profile = sections.find((s) => s.id === "profile");
  const personalHighlight = sections.find((s) => s.id === "personalHighlight");
  const familyHighlight = sections.find((s) => s.id === "familyHighlight");
  const careerHighlight = sections.find((s) => s.id === "careerHighlight");
  const beliefsHighlight = sections.find((s) => s.id === "beliefsHighlight");
  const declaration = sections.find((s) => s.id === "declaration");
  const contact = sections.find((s) => s.id === "contact");
  const photoSrc = formData.photo || "";
  const nameParts = (formData.fullName || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const restName = nameParts.slice(1).join(" ");

  return `
    <div class="bd-template bd-template17">
      <div class="bd17-hero">
        <div class="bd17-hero-text">
          <div class="bd17-name">
            <span class="bd17-name-line">${esc(firstName) || "&nbsp;"}</span>
            ${restName ? `<span class="bd17-name-line bd17-name-line-outline">${esc(restName)}</span>` : ""}
          </div>
          <div class="bd17-rule"></div>
          <div class="bd17-tagline">${esc(formData.tagline) || ""}</div>
        </div>
        <div class="bd17-photo-wrap">
          ${photoSrc
            ? `<img class="bd17-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd17-photo bd17-photo-placeholder">Photo</div>`}
        </div>
      </div>

      <div class="bd17-body">
        ${highlightRow(formData, personalHighlight, ICONS.personalHighlight)}
        ${highlightRow(formData, familyHighlight, ICONS.familyHighlight)}
        ${highlightRow(formData, careerHighlight, ICONS.careerHighlight)}
        ${highlightRow(formData, beliefsHighlight, ICONS.beliefsHighlight)}

        <div class="bd17-quote-box">
          <span class="bd17-quote-mark">&#8220;</span>
          <p>${formData.declarationText && formData.declarationText.trim() ? esc(formData.declarationText) : "I hereby declare that the above information is true and correct to the best of my knowledge."}</p>
          <span class="bd17-quote-mark bd17-quote-mark-close">&#8221;</span>
        </div>

        <div class="bd17-contact-row">
          ${formData.phone ? `<span>&#9742; ${esc(formData.phone)}</span>` : ""}
          ${formData.email ? `<span>&#9993; ${esc(formData.email)}</span>` : ""}
          ${formData.location ? `<span>&#128205; ${esc(formData.location)}</span>` : ""}
        </div>
      </div>
    </div>`;
}