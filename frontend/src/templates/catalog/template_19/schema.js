// schema.js — template_19 (Charcoal Portfolio Grid)
// Independent of every other template. Adapted from a dark bold-typography
// portfolio-resume reference (huge stacked name, black info cards, a
// timeline "journey" box, a logo-grid of clients) into biodata format: the
// client-logo grid becomes a compact Family card, the career timeline
// becomes an Education/Career timeline card, and a dark contact strip
// replaces the footer contact row.
export const schema = {
  id: "template_19",
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
            { id: "tagline", label: "Tagline (e.g. profession)", type: "text" },
          ],
        },
        {
          id: "about",
          title: "About Me",
          removable: true,
          custom: false,
          fields: [
            { id: "aboutMe", label: "About Me", type: "textarea" },
          ],
        },
        {
          id: "timeline",
          title: "Education & Career",
          removable: true,
          custom: false,
          fields: [
            { id: "timelineItem1", label: "Entry 1", type: "text", placeholder: "e.g. Senior Analyst — Company, 2023–Present" },
            { id: "timelineItem2", label: "Entry 2", type: "text" },
            { id: "timelineItem3", label: "Entry 3", type: "text" },
            { id: "timelineItem4", label: "Entry 4", type: "text" },
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
            { id: "maritalStatus", label: "Marital Status", type: "text" },
          ],
        },
        {
          id: "family",
          title: "Family",
          removable: true,
          custom: false,
          fields: [
            { id: "fatherName", label: "Father", type: "text" },
            { id: "motherName", label: "Mother", type: "text" },
            { id: "siblings", label: "Siblings", type: "text" },
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
