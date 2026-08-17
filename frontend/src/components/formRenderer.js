// formRenderer.js — GENERIC engine.
// Renders whatever pages/sections/fields/photos the current schema has, plus
// the controls to mutate that structure. Never edited when a template is
// added, changed, or removed.

import { getMissingRequiredFields, calculateAge } from "../templates/schemaUtils.js";
export { getMissingRequiredFields };

function escAttr(str) {
  return (str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// callbacks: {
//   onFieldChange(fieldId, value),
//   onAddSection(pageId, title), onRemoveSection(pageId, sectionId), onRenameSection(pageId, sectionId, title),
//   onAddField(pageId, sectionId, label), onRemoveField(pageId, sectionId, fieldId),
//   onAddPage(), onRemovePage(pageId),
//   onAddPhoto(), onRemovePhoto(photoId),
// }
export function renderForm(container, schema, formData, callbacks, options = {}) {
  container.innerHTML = "";

  renderPhotosBlock(container, schema, formData, callbacks);

  schema.pages.forEach((page, pageIndex) => {
    const pageWrap = document.createElement("div");
    pageWrap.className = "form-page";

    const pageHeader = document.createElement("div");
    pageHeader.className = "form-page-header";
    pageHeader.innerHTML = `<span>Page ${pageIndex + 1}</span>`;
    if (schema.pages.length > 1 && pageIndex > 0) {
      const removePageBtn = document.createElement("button");
      removePageBtn.type = "button";
      removePageBtn.className = "btn-link btn-danger";
      removePageBtn.textContent = "Remove page";
      removePageBtn.addEventListener("click", () => {
        if (confirm("Remove this page and all its sections?")) callbacks.onRemovePage(page.id);
      });
      pageHeader.appendChild(removePageBtn);
    }
    pageWrap.appendChild(pageHeader);

    page.sections.forEach((section) => {
      pageWrap.appendChild(renderSection(page.id, section, formData, callbacks, options));
    });

    const addSectionBtn = document.createElement("button");
    addSectionBtn.type = "button";
    addSectionBtn.className = "btn btn-secondary btn-add-section";
    addSectionBtn.textContent = "+ Add custom section";
    addSectionBtn.addEventListener("click", () => {
      const title = prompt("Section title (e.g. Hobbies, Contact Info):");
      if (title && title.trim()) callbacks.onAddSection(page.id, title.trim());
    });
    pageWrap.appendChild(addSectionBtn);

    container.appendChild(pageWrap);
  });

  const addPageBtn = document.createElement("button");
  addPageBtn.type = "button";
  addPageBtn.className = "btn btn-secondary btn-add-page";
  addPageBtn.textContent = "+ Add page";
  addPageBtn.addEventListener("click", () => callbacks.onAddPage());
  container.appendChild(addPageBtn);

  wireFieldInputs(container, callbacks);
}

function renderPhotosBlock(container, schema, formData, callbacks) {
  const wrap = document.createElement("div");
  wrap.className = "form-photos";

  schema.photos.forEach((photo, idx) => {
    const photoBlock = document.createElement("div");
    photoBlock.className = "form-field form-field-photo";

    const removeBtn = !photo.required
      ? `<button type="button" class="btn-link btn-danger" data-remove-photo="${photo.id}">Remove</button>`
      : "";

    // Primary photo (idx 0) is always locked into the template's designed
    // spot. Extra photos can be placed on any page the user has — that's
    // the "flexible photo placement" the builder offers.
    // Issue 6: placement is the only structural thing left in the form for
    // extra photos — shape/border/filter/stacking now live on the photo
    // itself in the live preview (Canva-style edit icon), see
    // dynamicExtras.js + livePreview.js.
    const placementHtml =
      idx > 0 && schema.pages.length > 0
        ? `
      <label class="photo-placement-label">Add to page</label>
      <select data-move-photo="${photo.id}" class="photo-placement-select">
        ${schema.pages
          .map(
            (p, i) =>
              `<option value="${p.id}" ${(photo.page || schema.pages[0].id) === p.id ? "selected" : ""}>Page ${i + 1}</option>`
          )
          .join("")}
      </select>`
        : "";

    photoBlock.innerHTML = `
      <label>${escAttr(photo.label)}${photo.required ? " *" : ""}${idx === 0 ? " (main)" : ""}</label>
      <input type="file" accept="image/*" data-field="${photo.id}" data-photo="true" />
      ${placementHtml}
      ${idx > 0 ? `<div class="photo-placement-label">Style, reorder & remove: use the edit (&#9998;) icon on the photo in the preview.</div>` : ""}
      ${removeBtn}
    `;
    photoBlock.querySelector("input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => callbacks.onFieldChange(photo.id, reader.result);
      reader.readAsDataURL(file);
    });
    const removeEl = photoBlock.querySelector("[data-remove-photo]");
    if (removeEl) removeEl.addEventListener("click", () => callbacks.onRemovePhoto(photo.id));
    const moveEl = photoBlock.querySelector("[data-move-photo]");
    if (moveEl) moveEl.addEventListener("change", (e) => callbacks.onMovePhoto(photo.id, e.target.value));

    wrap.appendChild(photoBlock);
  });

  if (schema.photos.length < 4) {
    const addPhotoBtn = document.createElement("button");
    addPhotoBtn.type = "button";
    addPhotoBtn.className = "btn btn-secondary btn-add-photo";
    addPhotoBtn.textContent = "+ Add photo";
    addPhotoBtn.addEventListener("click", () => callbacks.onAddPhoto());
    wrap.appendChild(addPhotoBtn);
  }

  container.appendChild(wrap);
}

function renderSection(pageId, section, formData, callbacks, options = {}) {
  const sectionEl = document.createElement("fieldset");
  sectionEl.className = "form-section";

  const legend = document.createElement("legend");
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.className = "section-title-input";
  titleInput.value = section.title;
  titleInput.addEventListener("change", (e) => callbacks.onRenameSection(pageId, section.id, e.target.value));
  legend.appendChild(titleInput);

  if (section.removable) {
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-link btn-danger";
    removeBtn.textContent = "Remove section";
    removeBtn.addEventListener("click", () => {
      if (confirm(`Remove "${section.title}"?`)) callbacks.onRemoveSection(pageId, section.id);
    });
    legend.appendChild(removeBtn);
  }
  sectionEl.appendChild(legend);

  const fieldsGrid = document.createElement("div");
  fieldsGrid.className = "form-fields-grid";
  section.fields.forEach((field) => {
    fieldsGrid.appendChild(renderField(pageId, section, field, formData, callbacks, options));
  });
  sectionEl.appendChild(fieldsGrid);

  const addFieldBtn = document.createElement("button");
  addFieldBtn.type = "button";
  addFieldBtn.className = "btn-link btn-add-field";
  addFieldBtn.textContent = "+ Add field";
  addFieldBtn.addEventListener("click", () => {
    const label = prompt("Field name (e.g. Blood Group):");
    if (label && label.trim()) callbacks.onAddField(pageId, section.id, label.trim());
  });
  sectionEl.appendChild(addFieldBtn);

  return sectionEl;
}

function renderField(pageId, section, field, formData, callbacks, options = {}) {
  const fieldEl = document.createElement("div");
  fieldEl.className = "form-field";
  if (field.type === "textarea") fieldEl.classList.add("form-field-full");
  // Issue 11: any non-required field can be removed (pre-built or custom) —
  // only required fields are locked to edit-only. Pre-built fields can never
  // be removed AS a definition, only their value cleared, but hiding them
  // from the biodata (what this button does) covers "I don't want to share
  // my age" without letting the section itself get corrupted.
  const removeFieldHtml = !field.required
    ? `<button type="button" class="btn-link btn-danger btn-remove-field" data-remove-field="${field.id}" title="Remove this field from your biodata">✕</button>`
    : "";
  const labelHtml = `<label for="f_${field.id}">${escAttr(field.label)}${field.required ? " *" : ""}</label>${removeFieldHtml}`;

  if (field.type === "textarea") {
    fieldEl.innerHTML = `
      ${labelHtml}
      <textarea id="f_${field.id}" rows="4" placeholder="${escAttr(field.placeholder || "")}" data-field="${field.id}"></textarea>
    `;
    fieldEl.querySelector("textarea").value = formData[field.id] || "";
  } else {
    fieldEl.innerHTML = `
      ${labelHtml}
      <input
        id="f_${field.id}"
        type="${field.type === "date" ? "date" : "text"}"
        placeholder="${escAttr(field.placeholder || "")}"
        data-field="${field.id}"
        value="${escAttr(formData[field.id] || "")}"
      />
    `;
  }
  const removeEl = fieldEl.querySelector("[data-remove-field]");
  if (removeEl) removeEl.addEventListener("click", () => callbacks.onRemoveField(pageId, section.id, field.id));

  // Age gate: only rendered for the field id the caller flagged (main.js
  // decides which field that is and whether it's active, based on whether
  // this template is a Marriage-category template — this file stays generic).
  if (options.ageGate && options.ageGate.fieldId === field.id) {
    const hint = document.createElement("div");
    hint.className = "field-hint";
    hint.dataset.ageHint = field.id;
    updateAgeHint(hint, formData[field.id], options.ageGate.minAge);
    fieldEl.appendChild(hint);
    const input = fieldEl.querySelector(`[data-field="${field.id}"]`);
    if (input) {
      input.addEventListener("input", (e) => updateAgeHint(hint, e.target.value, options.ageGate.minAge));
    }
  }

  return fieldEl;
}

// Issue 1: two kinds of problems, both flagged inline as the user types —
// (a) the date itself is nonsense (future DOB, or an age no living person
// has) — checked regardless of template category — and (b) the marriage
// 18+ rule, only when minAge > 0 (main.js only sets that for Marriage-
// category templates). Both are re-checked by main.js before every
// download anyway (see updateDownloadGate) — this hint is just the
// live, as-you-type version of the same rule so the problem is visible
// long before the user reaches the Download button.
function updateAgeHint(hintEl, dobValue, minAge) {
  const age = calculateAge(dobValue);
  if (age === null) {
    hintEl.textContent = "";
    hintEl.className = "field-hint";
    return;
  }
  if (age < 0) {
    hintEl.textContent = `That date of birth is in the future — please correct it.`;
    hintEl.className = "field-hint warn";
  } else if (age > 120) {
    hintEl.textContent = `That date of birth doesn't look right — please double-check it.`;
    hintEl.className = "field-hint warn";
  } else if (age < minAge) {
    hintEl.textContent = `Age is ${age}. Only ${minAge}+ is allowed for a marriage biodata.`;
    hintEl.className = "field-hint warn";
  } else {
    hintEl.textContent = `Age: ${age}`;
    hintEl.className = "field-hint ok";
  }
}

function wireFieldInputs(container, callbacks) {
  container.querySelectorAll("input[data-field], textarea[data-field]").forEach((input) => {
    if (input.type === "file") return;
    input.addEventListener("input", (e) => {
      callbacks.onFieldChange(e.target.dataset.field, e.target.value);
    });
  });
}