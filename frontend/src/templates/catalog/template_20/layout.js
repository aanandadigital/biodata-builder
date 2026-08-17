// layout.js — template_20 (Slate Traditional Detailed)
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
  return `<div class="bd20-line"><span class="bd20-line-label">${esc(label)}</span><span class="bd20-line-sep">:</span><span class="bd20-line-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span></div>`;
}

function sectionBlock(section, formData) {
  return `
    <div class="bd20-block">
      <h3 class="bd20-block-title">${esc(section?.title)}</h3>
      <div class="bd20-block-body">
        ${(section?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join("")}
      </div>
    </div>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const profile = sections.find((s) => s.id === "profile");
  const contact = sections.find((s) => s.id === "contact");
  const personal = sections.find((s) => s.id === "personal");
  const education = sections.find((s) => s.id === "education");
  const parents = sections.find((s) => s.id === "parents");
  const mosal = sections.find((s) => s.id === "mosal");
  const photoSrc = formData.photo || "";
  const eduLines = [formData.eduLine1, formData.eduLine2, formData.eduLine3].filter((v) => v && v.trim());

  return `
    <div class="bd-template bd-template20">
      <div class="bd20-header">
        <div class="bd20-photo-wrap">
          ${photoSrc
            ? `<img class="bd20-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd20-photo bd20-photo-placeholder">Photo</div>`}
        </div>
        <div class="bd20-header-text">
          <div class="bd20-name">${esc(formData.fullName) || "&nbsp;"}</div>
          <p class="bd20-intro">${formData.intro && formData.intro.trim() ? esc(formData.intro) : "&nbsp;"}</p>
        </div>
      </div>

      <div class="bd20-contact-bar">
        ${formData.email ? `<span>&#9993; ${esc(formData.email)}</span>` : ""}
        ${formData.phone ? `<span>&#9742; ${esc(formData.phone)}</span>` : ""}
        ${formData.residence ? `<span>&#128205; ${esc(formData.residence)}</span>` : ""}
        ${formData.officeAddress ? `<span>&#128188; ${esc(formData.officeAddress)}</span>` : ""}
      </div>

      <div class="bd20-body">
        <div class="bd20-col">
          ${sectionBlock(personal, formData)}
          <div class="bd20-block">
            <h3 class="bd20-block-title">${esc(education?.title)}</h3>
            <div class="bd20-block-body">
              ${eduLines.length
                ? eduLines.map((l) => `<div class="bd20-edu-line">${esc(l)}</div>`).join("")
                : `<div class="bd20-edu-line">&nbsp;</div>`}
            </div>
          </div>
        </div>
        <div class="bd20-col">
          ${sectionBlock(parents, formData)}
        </div>
      </div>

      <div class="bd20-mosal">
        <h3 class="bd20-block-title">${esc(mosal?.title)}</h3>
        <div class="bd20-mosal-body">
          ${(mosal?.fields || []).map((f) => line(f.label, fmt(f, formData[f.id]))).join("")}
        </div>
      </div>
    </div>`;
}