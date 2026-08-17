// layout.js — template_16 (Blush Timeline Scholar)
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

function chipList(value) {
  const items = (value || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!items.length) return `<div class="bd16-empty">&nbsp;</div>`;
  return `<ul class="bd16-list">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

function iconHeading(icon, title) {
  return `<div class="bd16-heading"><span class="bd16-icon">${icon}</span><h2>${esc(title)}</h2></div>`;
}

function row(label, value) {
  return `
    <div class="bd16-row">
      <span class="bd16-row-label">${esc(label)}</span>
      <span class="bd16-row-value">${value && value.trim() ? esc(value) : "&nbsp;"}</span>
    </div>`;
}

export function render(formData, liveSchema) {
    const sections = (liveSchema || schema).sections;
  const profile = sections.find((s) => s.id === "profile");
  const contact = sections.find((s) => s.id === "contact");
  const about = sections.find((s) => s.id === "about");
  const education = sections.find((s) => s.id === "education");
  const skillsLang = sections.find((s) => s.id === "skillsLang");
  const personal = sections.find((s) => s.id === "personal");
  const family = sections.find((s) => s.id === "family");
  const declaration = sections.find((s) => s.id === "declaration");
  const photoSrc = formData.photo || "";

  return `
    <div class="bd-template bd-template16">
      <aside class="bd16-sidebar">
        <div class="bd16-photo-wrap">
          ${photoSrc
            ? `<img class="bd16-photo" src="${photoSrc}" alt="Photo" />`
            : `<div class="bd16-photo bd16-photo-placeholder">Photo</div>`}
        </div>

        <div class="bd16-block">
          <h3 class="bd16-block-title">${esc(contact?.title)}</h3>
          <div class="bd16-contact-list">
            ${formData.email ? `<div class="bd16-contact-item">&#9993; ${esc(formData.email)}</div>` : ""}
            ${formData.phone ? `<div class="bd16-contact-item">&#9742; ${esc(formData.phone)}</div>` : ""}
            ${formData.location ? `<div class="bd16-contact-item">&#128205; ${esc(formData.location)}</div>` : ""}
          </div>
        </div>

        <div class="bd16-block">
          <h3 class="bd16-block-title">${esc((skillsLang?.title || "").split(" & ")[0])}</h3>
          ${chipList(formData.skills)}
        </div>

        <div class="bd16-block">
          <h3 class="bd16-block-title">${esc((skillsLang?.title || "").split(" & ")[1])}</h3>
          ${chipList(formData.languages)}
        </div>
      </aside>

      <main class="bd16-main">
        <div class="bd16-name">${esc(formData.fullName) || "&nbsp;"}</div>
        <div class="bd16-tagline">${esc(formData.tagline) || ""}</div>
        <div class="bd16-rule"></div>

        ${iconHeading("&#9997;", about?.title)}
        <p class="bd16-about">${formData.aboutMe && formData.aboutMe.trim() ? esc(formData.aboutMe) : "&nbsp;"}</p>

        ${iconHeading("&#127891;", education?.title)}
        <div class="bd16-timeline">
          ${[1, 2, 3].map((n) => {
            const title = formData[`eduTitle${n}`];
            const detail = formData[`eduDetail${n}`];
            if (!title && !detail) return "";
            return `
              <div class="bd16-timeline-item">
                <div class="bd16-timeline-dot"></div>
                <div class="bd16-timeline-title">${esc(title) || "&nbsp;"}</div>
                <div class="bd16-timeline-detail">${esc(detail) || ""}</div>
              </div>`;
          }).join("") || `<div class="bd16-empty">&nbsp;</div>`}
        </div>

        ${iconHeading("&#128100;", personal?.title)}
        <div class="bd16-section">
          ${(personal?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
        </div>

        ${iconHeading("&#127961;", family?.title)}
        <div class="bd16-section">
          ${(family?.fields || []).map((f) => row(f.label, fmt(f, formData[f.id]))).join("")}
        </div>

        ${iconHeading("&#128221;", declaration?.title)}
        <p class="bd16-about">I hereby declare that the above information is true and correct to the best of my knowledge.</p>
        <div class="bd16-sign-row">
          <span>Place: ${esc(formData.place) || "&nbsp;"}</span>
          <span class="bd16-signature">${esc(formData.fullName) || ""}</span>
        </div>
      </main>
    </div>`;
}