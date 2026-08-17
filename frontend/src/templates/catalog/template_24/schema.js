// schema.js — template_24 (Coral Panel Profile)
export const schema = {
  id: "template_24",
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
            { id: "dob", label: "Birth Date", type: "date", required: true },
            { id: "height", label: "Height", type: "text" },
            { id: "religion", label: "Religion", type: "text" },
            { id: "language", label: "Language", type: "text" },
            { id: "placeOfBirth", label: "Born in", type: "text" },
          ],
        },
        {
          id: "occupation",
          title: "Occupation",
          removable: true,
          custom: false,
          fields: [
            { id: "occupation", label: "Occupation", type: "text" },
          ],
        },
        {
          id: "education",
          title: "Education",
          removable: true,
          custom: false,
          fields: [
            { id: "eduLine1", label: "Line 1", type: "text" },
            { id: "eduLine2", label: "Line 2", type: "text" },
            { id: "eduLine3", label: "Line 3", type: "text" },
          ],
        },
        {
          id: "family",
          title: "Family",
          removable: true,
          custom: false,
          fields: [
            { id: "father", label: "Father", type: "text" },
            { id: "mother", label: "Mother", type: "text" },
            { id: "sibling", label: "Sibling", type: "text" },
            { id: "grandparents", label: "Grandparents", type: "text" },
            { id: "mosal", label: "Mosal", type: "text" },
          ],
        },
        {
          id: "interests",
          title: "Interests",
          removable: true,
          custom: false,
          fields: [
            { id: "interests", label: "Interests", type: "text" },
          ],
        },
        {
          id: "address",
          title: "Address",
          removable: true,
          custom: false,
          fields: [
            { id: "address", label: "Address", type: "text" },
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
