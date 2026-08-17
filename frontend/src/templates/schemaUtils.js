// schemaUtils.js — GENERIC engine.
// All page/section/photo mutation logic lives here so no template file,
// and no per-template code, ever needs to know how to add/remove a section.
// state.js is the only caller; it always works on a CLONED schema (see state.js),
// never the cached module export, so mutations never leak across template switches.

let uid = 0;
function nextId(prefix) {
  uid += 1;
  return `${prefix}_${Date.now()}_${uid}`;
}

// Deep-clone a template's schema so runtime mutations (add/remove section,
// rename, add page/photo) never touch the imported module's singleton object.
export function cloneSchema(schema) {
  const copy = JSON.parse(JSON.stringify({
    id: schema.id,
    photos: schema.photos,
    pages: schema.pages,
  }));
  return withCompatGetters(copy);
}

// Temporary bridge for old per-template layout.js files that still read
// schema.sections / schema.photo directly. Remove once all layout.js files
// are migrated to the generic pages-aware renderer (step 2).
function withCompatGetters(schema) {
  Object.defineProperty(schema, "sections", {
    get() {
      return schema.pages.flatMap((p) => p.sections);
    },
    enumerable: false,
  });
  Object.defineProperty(schema, "photo", {
    get() {
      return schema.photos[0];
    },
    enumerable: false,
  });
  return schema;
}

export function emptyFormData(schema) {
  const data = {};
  schema.photos.forEach((p) => { data[p.id] = null; });
  schema.pages.forEach((page) => {
    page.sections.forEach((section) => {
      section.fields.forEach((f) => { data[f.id] = ""; });
    });
  });
  return data;
}

export function getMissingRequiredFields(schema, formData) {
  const missing = [];
  schema.photos.forEach((p) => {
    if (p.required && !formData[p.id]) missing.push(p.label);
  });
  schema.pages.forEach((page) => {
    page.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.required && !(formData[field.id] || "").toString().trim()) {
          missing.push(field.label);
        }
      });
    });
  });
  return missing;
}

// --- structural mutations (all return void/id; they mutate the cloned schema in place) ---

export function addSection(schema, pageId, title) {
  const page = schema.pages.find((p) => p.id === pageId);
  if (!page) return null;
  const section = {
    id: nextId("section"),
    title: title || "New Section",
    removable: true,
    custom: true,
    fields: [],
  };
  page.sections.push(section);
  return section.id;
}

export function removeSection(schema, pageId, sectionId) {
  const page = schema.pages.find((p) => p.id === pageId);
  if (!page) return;
  const section = page.sections.find((s) => s.id === sectionId);
  if (!section || section.removable === false) return;
  page.sections = page.sections.filter((s) => s.id !== sectionId);
}

export function renameSection(schema, pageId, sectionId, newTitle) {
  const page = schema.pages.find((p) => p.id === pageId);
  const section = page?.sections.find((s) => s.id === sectionId);
  if (section) section.title = newTitle;
}

export function addFieldToSection(schema, pageId, sectionId, label) {
  const page = schema.pages.find((p) => p.id === pageId);
  const section = page?.sections.find((s) => s.id === sectionId);
  if (!section) return null;
  const field = { id: nextId("field"), label: label || "New Field", type: "text", required: false, custom: true };
  section.fields.push(field);
  return field.id;
}

export function removeField(schema, pageId, sectionId, fieldId) {
  const page = schema.pages.find((p) => p.id === pageId);
  const section = page?.sections.find((s) => s.id === sectionId);
  if (!section) return;
  const field = section.fields.find((f) => f.id === fieldId);
  // Issue 11: required fields can never be removed, custom or pre-built —
  // only edited. Everything else (pre-built or custom) is removable.
  if (!field || field.required) return;
  section.fields = section.fields.filter((f) => f.id !== fieldId);
}

const MAX_PAGES = 6;
export function addPage(schema) {
  if (schema.pages.length >= MAX_PAGES) return null;
  const page = { id: nextId("page"), sections: [] };
  schema.pages.push(page);
  return page.id;
}

export function removePage(schema, pageId) {
  if (schema.pages.length <= 1) return;
  if (pageId === schema.pages[0].id) return; // page 1 is never removable
  schema.pages = schema.pages.filter((p) => p.id !== pageId);
  // Any photo that was placed on the removed page falls back to page 1
  // instead of silently disappearing from every page.
  const page1Id = schema.pages[0].id;
  schema.photos.forEach((p) => {
    if (p.page === pageId) p.page = page1Id;
  });
}

const MAX_PHOTOS = 8;
export function addPhoto(schema, label) {
  if (schema.photos.length >= MAX_PHOTOS) return null;
  const extraIndex = schema.photos.length - 1; // 0-based among extra (non-primary) photos
  const col = extraIndex % 3;
  const row = Math.floor(extraIndex / 3);
  const photo = {
    id: nextId("photo"),
    label: label || "Additional Photo",
    shape: "square",
    required: false,
    page: schema.pages[0]?.id, // which page it renders on; user can move it
    // Freeform placement on that page — user can drag/resize in the live
    // preview. Cascaded defaults so new photos don't stack on top of each other.
    x: 40 + col * 150,
    y: 40 + row * 150,
    w: 120,
    h: 120,
    // Styling (issues 4 & 16): border + filter, editable per-photo.
    borderStyle: "solid", // solid | dashed | dotted | double | none
    borderWidth: 3,
    borderColor: null, // null = inherit the template's theme accent color
    filter: "none", // none | grayscale | sepia | vintage | cool | soft
  };
  schema.photos.push(photo);
  return photo.id;
}

export function removePhoto(schema, photoId) {
  const photo = schema.photos.find((p) => p.id === photoId);
  if (!photo || photo.required) return;
  schema.photos = schema.photos.filter((p) => p.id !== photoId);
}

// Lets the user decide which PAGE a non-primary photo appears on (primary
// photo stays in the template's designed slot; extra photos can go anywhere).
export function movePhoto(schema, photoId, pageId) {
  const photo = schema.photos.find((p) => p.id === photoId);
  if (!photo || photo.required) return;
  if (!schema.pages.some((p) => p.id === pageId)) return;
  photo.page = pageId;
}

// Persists a drag/resize done directly on the live preview.
export function positionPhoto(schema, photoId, { x, y, w, h }) {
  const photo = schema.photos.find((p) => p.id === photoId);
  if (!photo || photo.required) return;
  if (x != null) photo.x = Math.max(0, x);
  if (y != null) photo.y = Math.max(0, y);
  if (w != null) photo.w = Math.max(50, w);
  if (h != null) photo.h = Math.max(50, h);
}

// Issue 4 & 16: shape/border/filter styling, per extra photo.
export function setPhotoStyle(schema, photoId, patch) {
  const photo = schema.photos.find((p) => p.id === photoId);
  if (!photo || photo.required) return;
  ["shape", "borderStyle", "borderWidth", "borderColor", "filter"].forEach((key) => {
    if (key in patch) photo[key] = patch[key];
  });
}

// Issue 15: bring an extra (non-primary) photo to the front of the stack —
// one click, that photo is now on top of every other photo. Stacking order
// in the live preview overlay is just array order (later = drawn on top),
// so this moves it to the end of the array.
export function bringPhotoToFront(schema, photoId) {
  const idx = schema.photos.findIndex((p) => p.id === photoId);
  if (idx <= 0) return; // primary photo (index 0) is never reorderable
  const [photo] = schema.photos.splice(idx, 1);
  schema.photos.push(photo);
}

// Issue 1: finds whichever field IS this template's date-of-birth field,
// without any template needing to name it "dob" specifically (template_11
// and template_14 use Marathi/Sanskrit field ids, e.g. "janmaTarikh" — the
// old hardcoded "dob" lookup silently found nothing for those two and the
// age gate never fired). Every template's actual DOB field is its only
// REQUIRED field of type "date" (a secondary optional date, like
// template_08's Baptism Date, is never required) — so this is a safe,
// generic rule that needs no per-template registration and keeps working
// automatically as new templates are added.
export function findDobFieldId(schema) {
  for (const page of schema.pages) {
    for (const section of page.sections) {
      const match = section.fields.find((f) => f.type === "date" && f.required);
      if (match) return match.id;
    }
  }
  return null;
}

// Issue 13: age gate for marriage-category biodatas. Returns null if it
// cannot be determined (no/invalid DOB), otherwise the age in whole years.
export function calculateAge(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}