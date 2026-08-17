// schema.js — template_04 (Navy & Gold)
// Independent of every other template. Reference image has a dedicated
// Religious Details section (Sect, Maslak/Madhab) between Personal and
// Family — a field grouping unique to this template.
export const schema = {
  id: "template_04",
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
            { id: "timeOfBirth", label: "Time of Birth", type: "text" },
            { id: "placeOfBirth", label: "Place of Birth", type: "text" },
            { id: "motherTongue", label: "Mother Tongue", type: "text" },
            { id: "maritalStatus", label: "Marital Status", type: "text" },
            { id: "height", label: "Height", type: "text" },
            { id: "complexion", label: "Complexion", type: "text" },
            { id: "bloodGroup", label: "Blood Group", type: "text" },
            { id: "diet", label: "Diet", type: "text" },
            { id: "annualIncome", label: "Annual Income", type: "text" },
            { id: "hobbies", label: "Hobbies", type: "text" },
            { id: "education", label: "Education", type: "text" },
            { id: "occupation", label: "Occupation", type: "text" },
          ],
        },
        {
          id: "religious",
          title: "Religious Details",
          removable: true,
          custom: false,
          fields: [
            { id: "sect", label: "Sect", type: "text", placeholder: "e.g. Sunni" },
            { id: "maslak", label: "Maslak / Madhab", type: "text", placeholder: "e.g. Hanafi" },
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
            { id: "familyType", label: "Family Type", type: "text" },
            { id: "fatherOccupation", label: "Father's Occupation", type: "text" },
            { id: "nativePlace", label: "Native Place", type: "text" },
            { id: "brothers", label: "Brothers", type: "text" },
            { id: "sisters", label: "Sisters", type: "text" },
          ],
        },
        {
          id: "contact",
          title: "Contact Details",
          removable: true,
          custom: false,
          fields: [
            { id: "mobileNumber", label: "Mobile Number", type: "text", required: true },
            { id: "email", label: "Email Address", type: "text" },
            { id: "currentAddress", label: "Current Address", type: "text" },
            { id: "permanentAddress", label: "Permanent Address", type: "text" },
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
