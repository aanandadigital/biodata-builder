// layout.js — template_01 (Uttarakhand Aipan Art — Vasudhara / Aipan Bel)

import { schema } from "./schema.js";

function esc(str) {
  return (str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function fmt(field, value) {
  if (field.type !== "date" || !value) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function row(label, value) {
  return `
    <div class="bd-row">
      <span class="bd-label">${esc(label)}</span>
      <span class="bd-colon">:</span>
      <span class="bd-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span>
    </div>`;
}

export function render(formData, liveSchema) {
  const sections = (liveSchema || schema).sections;
  const personal = sections.find((s) => s.id === "personal");
  const family = sections.find((s) => s.id === "family");

  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template01">
      <!-- Vasudhara / Aipan Bel border strips -->
      <div class="bd-edge bd-edge-top"></div>
      <div class="bd-edge bd-edge-bottom"></div>
      <div class="bd-edge bd-edge-left"></div>
      <div class="bd-edge bd-edge-right"></div>

      <!-- Aipan rosette corners -->
      <div class="bd-corner bd-corner-tl"></div>
      <div class="bd-corner bd-corner-tr"></div>
      <div class="bd-corner bd-corner-bl"></div>
      <div class="bd-corner bd-corner-br"></div>

      <div class="bd-content">
        <!-- Circular Photo Frame -->
        <div class="bd-photo-wrap">
          ${
            photoSrc
              ? `<img class="bd-photo" src="${photoSrc}" alt="Photo" />`
              : `<div class="bd-photo bd-photo-placeholder">Photo</div>`
          }
        </div>

        ${
          personal
            ? `
        <h2 class="bd-section-title">${esc(personal.title)}</h2>
        <div class="bd-section">
          ${(personal.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
        </div>`
            : ""
        }

        ${
          family
            ? `
        <h2 class="bd-section-title">${esc(family.title)}</h2>
        <div class="bd-section">
          ${(family.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
        </div>`
            : ""
        }
      </div>
    </div>`;
}