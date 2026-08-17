// schema.js — template_21 (Vintage Parchment Scroll)
export const schema = {
  id: "template_21",
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
            { id: "invocation", label: "Invocation line (optional)", type: "text", placeholder: "e.g. || Shree Ganeshaya Namah ||" },
            { id: "fullName", label: "Full Name", type: "text", required: true },
            { id: "dobDisplay", label: "Date of Birth (display)", type: "text", placeholder: "e.g. 15th December 1995" },
          ],
        },
        {
          id: "personal",
          title: "Personal Details",
          removable: true,
          custom: false,
          fields: [
            { id: "birthDetails", label: "Birth Time & Place", type: "text" },
            { id: "heightWeight", label: "Height & Weight", type: "text" },
            { id: "diet", label: "Diet", type: "text" },
            { id: "religion", label: "Religion", type: "text" },
            { id: "nativePlace", label: "Native Place", type: "text" },
            { id: "hobbies", label: "Hobbies", type: "text" },
          ],
        },
        {
          id: "qualification",
          title: "Qualification and Profession",
          removable: true,
          custom: false,
          fields: [
            { id: "occupation", label: "Occupation", type: "text" },
            { id: "qualification", label: "Qualification", type: "text" },
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
            { id: "sibling", label: "Sibling", type: "text" },
            { id: "mosal", label: "Mosal", type: "text" },
          ],
        },
        {
          id: "address",
          title: "Address Details",
          removable: true,
          custom: false,
          fields: [
            { id: "residence1", label: "Residence 1", type: "text" },
            { id: "residence2", label: "Residence 2", type: "text" },
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
