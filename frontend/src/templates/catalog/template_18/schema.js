// schema.js — template_18 (Ivory Editorial Bride)
// Independent of every other template. Adapted from an elegant blush/ivory
// triptych-photo "BRIDE" poster reference — no data fields in the source,
// since it's a pure photo-caption design — into a full biodata: kept the
// large serif wordmark hero and short italic caption line, added the
// standard Personal/Family/Contact sections below in matching editorial type.
export const schema = {
  id: "template_18",
  photos: [
    { id: "photo", label: "Photo", shape: "rect", required: true },
  ],
  pages: [
    {
      id: "page1",
      sections: [
        {
          id: "profile",
          title: "Profile",
          removable: false,
          custom: false,
          fields: [
            { id: "fullName", label: "Full Name", type: "text", required: true },
            { id: "caption", label: "Caption (short italic line)", type: "textarea", placeholder: "A short personal line, e.g. a favourite quote or motto." },
          ],
        },
        {
          id: "personal",
          title: "Personal Details",
          removable: true,
          custom: false,
          fields: [
            { id: "dob", label: "Date of Birth", type: "date", required: true },
            { id: "placeOfBirth", label: "Place of Birth", type: "text" },
            { id: "height", label: "Height", type: "text" },
            { id: "religion", label: "Religion", type: "text" },
            { id: "caste", label: "Caste / Community", type: "text" },
            { id: "education", label: "Education", type: "text" },
            { id: "occupation", label: "Occupation", type: "text" },
          ],
        },
        {
          id: "family",
          title: "Family Details",
          removable: true,
          custom: false,
          fields: [
            { id: "fatherName", label: "Father's Name", type: "text" },
            { id: "motherName", label: "Mother's Name", type: "text" },
            { id: "siblings", label: "Siblings", type: "text" },
          ],
        },
        {
          id: "contact",
          title: "Contact",
          removable: true,
          custom: false,
          fields: [
            { id: "phone", label: "Phone", type: "text", required: true },
            { id: "email", label: "Email", type: "text" },
            { id: "residence", label: "Residence", type: "text" },
          ],
        },
      ],
    },
  ],
};

// --- temporary back-compat shim for layout.js (removed once layout.js is
// migrated to the generic pages-aware renderer) ---
Object.defineProperty(schema, "sections", {
  get() { return schema.pages.flatMap((p) => p.sections); },
  enumerable: false,
});
Object.defineProperty(schema, "photo", {
  get() { return schema.photos[0]; },
  enumerable: false,
});
