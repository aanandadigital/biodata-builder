// schema.js — template_05 (Heritage Wood)
// Independent of every other template. Reference groups Religion, Community
// and Family Lineage directly into Personal Details (no separate religious
// section), and Family Details includes Maternal Uncle + Relatives, which
// no other template so far has.
export const schema = {
  id: "template_05",
  photos: [
    { id: "photo", label: "Photo", shape: "rect", required: true },
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
            { id: "fullName", label: "Full Name", type: "text", required: true },
            { id: "dob", label: "Date of Birth", type: "date", required: true },
            { id: "height", label: "Height", type: "text" },
            { id: "placeOfBirth", label: "Place of Birth", type: "text" },
            { id: "religion", label: "Religion", type: "text" },
            { id: "community", label: "Community", type: "text", placeholder: "e.g. Sunni" },
            { id: "familyLineage", label: "Family Lineage", type: "text" },
            { id: "complexion", label: "Complexion", type: "text" },
            { id: "bloodGroup", label: "Blood Group", type: "text" },
            { id: "highestEducation", label: "Highest Education", type: "text" },
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
            { id: "fatherOccupation", label: "Father's Occupation", type: "text" },
            { id: "motherName", label: "Mother's Name", type: "text" },
            { id: "motherOccupation", label: "Mother's Occupation", type: "text" },
            { id: "brothers", label: "Brothers", type: "text" },
            { id: "sisters", label: "Sisters", type: "text" },
            { id: "maternalUncle", label: "Maternal Uncle", type: "text" },
            { id: "relatives", label: "Relatives", type: "text" },
          ],
        },
        {
          id: "contact",
          title: "Contact Details",
          removable: true,
          custom: false,
          fields: [
            { id: "mobileNumber", label: "Mobile Number", type: "text", required: true },
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
