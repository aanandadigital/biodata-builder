// schema.js — template_22 (Floral Botanical Sidebar)
export const schema = {
  id: "template_22",
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
          id: "personal",
          title: "Personal Details",
          removable: true,
          custom: false,
          fields: [
            { id: "dob", label: "Date of Birth", type: "date", required: true },
            { id: "placeOfBirth", label: "Place of Birth", type: "text" },
            { id: "birthTime", label: "Birth Time", type: "text" },
            { id: "height", label: "Height", type: "text" },
            { id: "complexion", label: "Complexion", type: "text" },
            { id: "hobbies", label: "Hobbies", type: "text" },
            { id: "caste", label: "Caste", type: "text" },
          ],
        },
        {
          id: "family",
          title: "Family Details",
          removable: true,
          custom: false,
          fields: [
            { id: "father", label: "Father", type: "text" },
            { id: "mother", label: "Mother", type: "text" },
            { id: "siblings", label: "Siblings", type: "text" },
            { id: "grandfather", label: "Grandfather", type: "text" },
            { id: "grandmother", label: "Grandmother", type: "text" },
            { id: "mosal", label: "Mosal", type: "text" },
          ],
        },
        {
          id: "qualification",
          title: "Qualification",
          removable: true,
          custom: false,
          fields: [
            { id: "qualification", label: "Qualification", type: "text" },
            { id: "profession", label: "Current Profession", type: "text" },
          ],
        },
        {
          id: "contact",
          title: "Contact",
          removable: true,
          custom: false,
          fields: [
            { id: "residentialAddress", label: "Residential Address", type: "text" },
            { id: "contactPrimary", label: "Contact", type: "text", required: true },
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
