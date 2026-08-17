// schema.js — template_17 (Noir Portrait Editorial)
// Independent of every other template. Adapted from a dark cinematic
// tribute-poster reference (big stacked name type, large portrait, numbered
// icon-list of traits, closing quote/byline) into biodata format: the
// icon-list becomes four fixed highlight rows (Personal / Family / Career /
// Beliefs) instead of free virtues, and the closing quote becomes the
// standard declaration line.
export const schema = {
  id: "template_17",
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
            { id: "tagline", label: "Tagline (e.g. community / profession)", type: "text" },
          ],
        },
        {
          id: "personalHighlight",
          title: "Personal",
          removable: true,
          custom: false,
          fields: [
            { id: "dob", label: "Date of Birth", type: "date", required: true },
            { id: "height", label: "Height", type: "text" },
            { id: "personalNote", label: "Note", type: "text", placeholder: "e.g. Non-smoker, teetotaller" },
          ],
        },
        {
          id: "familyHighlight",
          title: "Family",
          removable: true,
          custom: false,
          fields: [
            { id: "fatherName", label: "Father's Name", type: "text" },
            { id: "motherName", label: "Mother's Name", type: "text" },
            { id: "familyNote", label: "Note", type: "text", placeholder: "e.g. Joint family, settled in..." },
          ],
        },
        {
          id: "careerHighlight",
          title: "Career",
          removable: true,
          custom: false,
          fields: [
            { id: "occupation", label: "Occupation", type: "text" },
            { id: "education", label: "Education", type: "text" },
            { id: "careerNote", label: "Note", type: "text" },
          ],
        },
        {
          id: "beliefsHighlight",
          title: "Beliefs",
          removable: true,
          custom: false,
          fields: [
            { id: "religion", label: "Religion", type: "text" },
            { id: "caste", label: "Caste / Community", type: "text" },
            { id: "beliefsNote", label: "Note", type: "text" },
          ],
        },
        {
          id: "declaration",
          title: "Declaration",
          removable: true,
          custom: false,
          fields: [
            { id: "declarationText", label: "Closing line", type: "textarea", placeholder: "A short personal closing note or quote." },
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
            { id: "location", label: "Location", type: "text" },
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
