// schema.js — template_13 (Chattogram Ornate)
// Independent of every other template. Second Muslim template with an
// Expectations field (after none of 04-06 have one), plus a Nationality
// field that no other template carries — matches Bangladeshi Muslim
// biodata references which state nationality/regional identity explicitly.
// Family is captured as a single narrative field rather than row-per-relative,
// since the reference lists each sibling's marital status and occupation
// inline as prose.
export const schema = {
  id: "template_13",
  photos: [
    { id: "photo", label: "Photo", shape: "circle", required: true },
  ],
  pages: [
    {
      id: "page1",
      sections: [
        {
          id: "personal",
          title: "Personal Details",
          removable: false,
          custom: false,
          fields: [
            { id: "fullName", label: "Name", type: "text", required: true },
            { id: "religion", label: "Religion", type: "text" },
            { id: "nationality", label: "Nationality", type: "text" },
            { id: "dob", label: "Date of Birth", type: "date", required: true },
            { id: "height", label: "Height", type: "text" },
            { id: "education", label: "Education", type: "text" },
            { id: "occupation", label: "Occupation", type: "text" },
          ],
        },
        {
          id: "family",
          title: "Family Background",
          removable: true,
          custom: false,
          fields: [
            { id: "fatherName", label: "Father's Name", type: "text" },
            { id: "motherName", label: "Mother's Name", type: "text" },
            { id: "siblingsSummary", label: "Siblings", type: "textarea" },
          ],
        },
        {
          id: "expectations",
          title: "Expectations",
          removable: true,
          custom: false,
          fields: [
            { id: "expectations", label: "Expectations", type: "textarea" },
          ],
        },
        {
          id: "contact",
          title: "Contact",
          removable: true,
          custom: false,
          fields: [
            { id: "contactPhone", label: "Phone", type: "text", required: true },
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
