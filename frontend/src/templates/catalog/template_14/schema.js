// schema.js — template_14 (Sanskrit Vivaha Vrittapatram)
// Independent of every other template. Second language-specific template
// after template_11 (Marathi), this one in Sanskrit — a clean single-column
// minimal layout, deliberately different from template_11's ornate red/gold
// temple-poster look, to keep the two language variants visually distinct
// from each other as well as from the rest of the catalog.
export const schema = {
  id: "template_14",
  photos: [
    { id: "photo", label: "छायाचित्रम्", shape: "rect", required: true },
  ],
  pages: [
    {
      id: "page1",
      sections: [
        {
          id: "personal",
          title: "वैयक्तिक-विवरणम्",
          removable: false,
          custom: false,
          fields: [
            { id: "naama", label: "नाम", type: "text", required: true },
            { id: "janmadinankah", label: "जन्मदिनाङ्कः", type: "date", required: true },
            { id: "unnatyam", label: "औन्नत्यम्", type: "text" },
            { id: "shikshanam", label: "शिक्षणम्", type: "text" },
            { id: "udyogah", label: "उद्योगः", type: "text" },
          ],
        },
        {
          id: "jyotish",
          title: "ज्योतिष-विवरणम्",
          removable: true,
          custom: false,
          fields: [
            { id: "gotram", label: "गोत्रम्", type: "text" },
          ],
        },
        {
          id: "family",
          title: "परिवार-विवरणम्",
          removable: true,
          custom: false,
          fields: [
            { id: "pituhNaama", label: "पितुः नाम", type: "text" },
            { id: "matuhNaama", label: "मातुः नाम", type: "text" },
            { id: "sahodarah", label: "सहोदराः", type: "text" },
            { id: "nivasah", label: "निवासः", type: "text" },
            { id: "doorvani", label: "दूरवाणी", type: "text" },
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
