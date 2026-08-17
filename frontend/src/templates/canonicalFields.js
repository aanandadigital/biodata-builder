// canonicalFields.js — GENERIC engine, never edited per template.
//
// Different templates use different field ids for the same real-world thing
// (dob / janmaTarikh / janmadinankah are all "date of birth"; fullName / name
// are both "name"). This file is the ONE place that knows those groupings,
// so a user who fills template_01 and then switches to template_11 doesn't
// have to retype their name, DOB, height, education, etc. — only fields that
// are genuinely unique to a template (Gotra, Kuldaivat, Sect...) still need
// filling per template, which is correct: those aren't the same field
// anywhere else.
//
// Verified against every schema.js in catalog/ before writing this list:
// no two ids in the SAME alias group ever appear together in one template's
// schema (e.g. currentAddress/permanentAddress are kept as separate
// canonical keys, not merged, because 3 templates use both at once).
const ALIAS_GROUPS = {
  name: ["fullName", "name"],
  dob: ["dob", "janmaTarikh", "janmadinankah"],
  height: ["height"],
  weight: ["weight"],
  education: ["education", "qualification"],
  profession: ["profession", "occupation", "work"],
  income: ["salary", "annualIncome"],
  religion: ["religion", "religious"],
  caste: ["caste"],
  gotra: ["gotra"],
  motherTongue: ["motherTongue"],
  maritalStatus: ["maritalStatus"],
  complexion: ["complexion"],
  bloodGroup: ["bloodGroup"],
  diet: ["diet"],
  fatherName: ["fatherName", "father"],
  fatherOccupation: ["fatherOccupation"],
  motherName: ["motherName", "mother"],
  motherOccupation: ["motherOccupation"],
  siblings: ["siblings", "sibling"],
  brothers: ["brothers"],
  sisters: ["sisters"],
  hobby: ["hobbies", "hobby"],
  phone: ["phone", "mobileNumber"],
  email: ["email"],
  address: ["address", "residentialAddress", "location", "residence"],
  currentAddress: ["currentAddress"],
  permanentAddress: ["permanentAddress"],
  nativePlace: ["nativePlace"],
  placeOfBirth: ["placeOfBirth"],
  timeOfBirth: ["timeOfBirth"],
  aboutMe: ["aboutMe"],
  expectations: ["expectations"],
  nationality: ["nationality"],
  familyType: ["familyType"],
  sect: ["sect"],
  mosal: ["mosal"],
  rashi: ["rashi"],
};

// Flattened once at module load: any field id -> its canonical key.
// A field id that isn't in any group (template-unique fields, e.g. Kuldaivat,
// Nadi, Baptism Date) simply isn't in this map and never carries over —
// which is correct, since it has no equivalent anywhere else.
const FIELD_ID_TO_CANONICAL = {};
Object.entries(ALIAS_GROUPS).forEach(([canonical, ids]) => {
  ids.forEach((id) => { FIELD_ID_TO_CANONICAL[id] = canonical; });
});

export function getCanonicalKey(fieldId) {
  return FIELD_ID_TO_CANONICAL[fieldId] || null;
}

// Every template's primary photo is always photos[0], id "photo" (verified
// across all 24 catalog schemas) — carried over the same way as any other
// canonical field, just keyed separately since photos live outside `pages`.
export const PHOTO_CANONICAL_KEY = "photo";

// Reads every field currently filled in `formData` (per `schema`) and folds
// it into `pool` (a flat { canonicalKey: value } object) under its canonical
// key, when it has one. Called on every field edit so the pool always
// reflects the latest value typed anywhere.
export function updateCanonicalPool(pool, schema, formData) {
  if (schema.photos[0] && formData[schema.photos[0].id]) {
    pool[PHOTO_CANONICAL_KEY] = formData[schema.photos[0].id];
  }
  schema.pages.forEach((page) => {
    page.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const key = getCanonicalKey(field.id);
        if (!key) return;
        const value = formData[field.id];
        if (value != null && value.toString().trim() !== "") pool[key] = value;
      });
    });
  });
}

// Applied once, right when a template is freshly opened (no existing draft
// for it) — pre-fills every field that has a canonical match in `pool`,
// leaving template-unique fields blank as usual. Never overwrites a field
// the user already has a value for (only matters if called more than once).
export function applyCanonicalCarryover(schema, formData, pool) {
  if (!pool) return;
  const photoField = schema.photos[0];
  if (photoField && !formData[photoField.id] && pool[PHOTO_CANONICAL_KEY]) {
    formData[photoField.id] = pool[PHOTO_CANONICAL_KEY];
  }
  schema.pages.forEach((page) => {
    page.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const key = getCanonicalKey(field.id);
        if (!key) return;
        const existing = formData[field.id];
        if (existing != null && existing.toString().trim() !== "") return;
        if (pool[key] != null) formData[field.id] = pool[key];
      });
    });
  });
}
