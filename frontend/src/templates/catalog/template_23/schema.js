// schema.js — template_23 (Split Header Duo)
export const schema = {
  id: "template_23",
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
          ],
        },
        {
          id: "contact",
          title: "Contact",
          removable: true,
          custom: false,
          fields: [
            { id: "contactPrimary", label: "Contact", type: "text", required: true },
            { id: "contactSecondary", label: "Email", type: "text" },
          ],
        },
        {
          id: "personal",
          title: "Personal Details",
          removable: true,
          custom: false,
          fields: [
            { id: "height", label: "Height", type: "text" },
            { id: "weight", label: "Weight", type: "text" },
            { id: "dob", label: "Date of Birth", type: "date", required: true },
            { id: "timeOfBirth", label: "Time of Birth", type: "text" },
            { id: "placeOfBirth", label: "Place of Birth", type: "text" },
            { id: "caste", label: "Caste", type: "text" },
            { id: "nativePlace", label: "Native Place", type: "text" },
            { id: "gotra", label: "Gotra", type: "text" },
            { id: "qualification", label: "Qualification", type: "text" },
            { id: "occupation", label: "Occupation", type: "text" },
            { id: "hobbies", label: "Hobbies", type: "text" },
            { id: "location", label: "Location", type: "text" },
          ],
        },
        {
          id: "family",
          title: "Family Background",
          removable: true,
          custom: false,
          fields: [
            { id: "paternalGrandfather", label: "Paternal Grandfather", type: "text" },
            { id: "paternalGrandmother", label: "Paternal Grandmother", type: "text" },
            { id: "father", label: "Father", type: "text" },
            { id: "fatherOccupation", label: "Father's Occupation", type: "text" },
            { id: "mother", label: "Mother", type: "text" },
            { id: "motherOccupation", label: "Mother's Occupation", type: "text" },
            { id: "mosal", label: "Mosal", type: "text" },
            { id: "sibling", label: "Sibling", type: "text" },
            { id: "siblingOccupation", label: "Sibling's Occupation", type: "text" },
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
