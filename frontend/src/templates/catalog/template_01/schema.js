// schema.js — template_01 (Uttarakhand Aipan Art — Vasudhara / Aipan Bel)
export const schema = {
  id: "template_01",
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
            { id: "name", label: "Name", type: "text", required: true },
            { id: "dob", label: "Date Of Birth", type: "date", required: true },
            { id: "village", label: "Native Place / Village", type: "text" },
            { id: "weight", label: "Weight", type: "text", placeholder: "e.g. 67 Kg" },
            { id: "height", label: "Height", type: "text", placeholder: "e.g. 5 ft. 7 in." },
            { id: "education", label: "Education", type: "text" },
            { id: "profession", label: "Occupation / Profession", type: "text" },
            { id: "salary", label: "Income / Salary", type: "text", placeholder: "e.g. 3.7 LPA" },
            { id: "hobby", label: "Hobbies", type: "text" },
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
            { id: "siblings", label: "Siblings", type: "text", placeholder: "e.g. 1 Sister / 1 Brother" },
          ],
        },
      ],
    },
  ],
};

Object.defineProperty(schema, "sections", {
  get() { return schema.pages.flatMap((p) => p.sections); },
  enumerable: false,
});
Object.defineProperty(schema, "photo", {
  get() { return schema.photos[0]; },
  enumerable: false,
});