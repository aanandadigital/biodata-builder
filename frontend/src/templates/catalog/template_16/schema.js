// schema.js — template_16 (Blush Timeline Scholar)
// Independent of every other template. Adapted from a pink icon-badge student
// resume reference into full biodata format: added Family Details (absent in
// the reference, since it's a resume not a biodata) and a Declaration/signature
// block, kept the reference's distinctive 3-step education timeline and
// dark contact/skills/languages sidebar blocks.
export const schema = {
  id: "template_16",
  photos: [
    { id: "photo", label: "Photo", shape: "circle", required: true },
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
            { id: "tagline", label: "Tagline (e.g. profession or degree)", type: "text" },
          ],
        },
        {
          id: "contact",
          title: "Contact",
          removable: true,
          custom: false,
          fields: [
            { id: "email", label: "Email", type: "text" },
            { id: "phone", label: "Phone", type: "text", required: true },
            { id: "location", label: "Location", type: "text" },
          ],
        },
        {
          id: "about",
          title: "About Me",
          removable: true,
          custom: false,
          fields: [
            { id: "aboutMe", label: "About Me", type: "textarea", placeholder: "A short, warm introduction about yourself." },
          ],
        },
        {
          id: "education",
          title: "Education",
          removable: true,
          custom: false,
          fields: [
            { id: "eduTitle1", label: "Qualification 1", type: "text" },
            { id: "eduDetail1", label: "Institution / Year 1", type: "text" },
            { id: "eduTitle2", label: "Qualification 2", type: "text" },
            { id: "eduDetail2", label: "Institution / Year 2", type: "text" },
            { id: "eduTitle3", label: "Qualification 3", type: "text" },
            { id: "eduDetail3", label: "Institution / Year 3", type: "text" },
          ],
        },
        {
          id: "skillsLang",
          title: "Skills & Languages",
          removable: true,
          custom: false,
          fields: [
            { id: "skills", label: "Skills (comma separated)", type: "text" },
            { id: "languages", label: "Languages (comma separated)", type: "text" },
          ],
        },
        {
          id: "personal",
          title: "Personal Details",
          removable: true,
          custom: false,
          fields: [
            { id: "dob", label: "Date of Birth", type: "date", required: true },
            { id: "height", label: "Height", type: "text" },
            { id: "religion", label: "Religion", type: "text" },
            { id: "nationality", label: "Nationality", type: "text" },
            { id: "maritalStatus", label: "Marital Status", type: "text" },
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
          id: "declaration",
          title: "Declaration",
          removable: true,
          custom: false,
          fields: [
            { id: "place", label: "Place", type: "text" },
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
