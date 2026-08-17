// registry.js
// The ONLY file that needs a new line when a template is added or removed.
// Each entry is fully self-contained: its own schema, layout and style live
// under templates/catalog/<id>/ and nowhere else references them directly.

export const TEMPLATE_REGISTRY = [
  {
    id: "template_01",
    name: "Classic Ivory",
    community: "Hindu",
    description: "Traditional cream & charcoal biodata with corner floral flourishes and a circular photo frame.",
    thumbnail: "./src/assets/thumbnails/template_01.png",
    loadSchema: () => import("./catalog/template_01/schema.js"),
    loadLayout: () => import("./catalog/template_01/layout.js"),
    styleHref: "./src/templates/catalog/template_01/style.css",
  },
  {
    id: "template_02",
    name: "Vedic Sage",
    community: "Hindu",
    description: "Sanskrit invocation header on a green Vedic theme, with a dedicated astrological (Gotra) section.",
    thumbnail: "./src/assets/thumbnails/template_02.png",
    loadSchema: () => import("./catalog/template_02/schema.js"),
    loadLayout: () => import("./catalog/template_02/layout.js"),
    styleHref: "./src/templates/catalog/template_02/style.css",
  },
  {
    id: "template_03",
    name: "Royal Maroon",
    community: "Hindu",
    description: "Ornate maroon & gold design with a diamond-pattern border, geared toward bride biodata.",
    thumbnail: "./src/assets/thumbnails/template_03.png",
    loadSchema: () => import("./catalog/template_03/schema.js"),
    loadLayout: () => import("./catalog/template_03/layout.js"),
    styleHref: "./src/templates/catalog/template_03/style.css",
  },
  {
    id: "template_04",
    name: "Navy & Gold",
    community: "Muslim",
    description: "Elegant navy background with gold typography, including a dedicated Sect / Maslak section.",
    thumbnail: "./src/assets/thumbnails/template_04.png",
    loadSchema: () => import("./catalog/template_04/schema.js"),
    loadLayout: () => import("./catalog/template_04/layout.js"),
    styleHref: "./src/templates/catalog/template_04/style.css",
  },
  {
    id: "template_05",
    name: "Heritage Wood",
    community: "Muslim",
    description: "Warm earthy wood-texture background with rust corner borders and Arabic-script accent.",
    thumbnail: "./src/assets/thumbnails/template_05.png",
    loadSchema: () => import("./catalog/template_05/schema.js"),
    loadLayout: () => import("./catalog/template_05/layout.js"),
    styleHref: "./src/templates/catalog/template_05/style.css",
  },
  {
    id: "template_06",
    name: "Blossom Pink",
    community: "Muslim",
    description: "Soft pink theme with a dedicated Birth Name field alongside legal Full Name and a Sect / Maslak section.",
    thumbnail: "./src/assets/thumbnails/template_06.png",
    loadSchema: () => import("./catalog/template_06/schema.js"),
    loadLayout: () => import("./catalog/template_06/layout.js"),
    styleHref: "./src/templates/catalog/template_06/style.css",
  },
  {
    id: "template_07",
    name: "Sacred Minimal",
    community: "Christian",
    description: "Deliberately spare black & white layout (no religious-details section, unlike template_08) with a Work field distinct from Occupation.",
    thumbnail: "./src/assets/thumbnails/template_07.png",
    loadSchema: () => import("./catalog/template_07/schema.js"),
    loadLayout: () => import("./catalog/template_07/layout.js"),
    styleHref: "./src/templates/catalog/template_07/style.css",
  },
  {
    id: "template_08",
    name: "Sky Blue Faith",
    community: "Christian",
    description: "Sky-blue theme with the most detailed religious section yet — Church, Denomination, Diocese, Parish, Confirmation, Sacraments and Baptism Date.",
    thumbnail: "./src/assets/thumbnails/template_08.png",
    loadSchema: () => import("./catalog/template_08/schema.js"),
    loadLayout: () => import("./catalog/template_08/layout.js"),
    styleHref: "./src/templates/catalog/template_08/style.css",
  },
  {
    id: "template_09",
    name: "Sikh Sacred Gold",
    community: "Sikh",
    description: "Gold & navy theme with the Ik Onkar symbol and Waheguru invocation — first Sikh-community template in the catalog.",
    thumbnail: "./src/assets/thumbnails/template_09.png",
    loadSchema: () => import("./catalog/template_09/schema.js"),
    loadLayout: () => import("./catalog/template_09/layout.js"),
    styleHref: "./src/templates/catalog/template_09/style.css",
  },
  {
    id: "template_10",
    name: "Modern Narrative",
    community: "Hindu",
    description: "Dark card-grid layout built around free-text About Myself / Expectations sections alongside Overview, Family and Beliefs — structurally distinct from the row-based templates.",
    thumbnail: "./src/assets/thumbnails/template_10.png",
    loadSchema: () => import("./catalog/template_10/schema.js"),
    loadLayout: () => import("./catalog/template_10/layout.js"),
    styleHref: "./src/templates/catalog/template_10/style.css",
  },
  {
    id: "template_11",
    name: "Marathi Kuldaivat",
    community: "Hindu",
    description: "First Marathi-language template — Devanagari labels with Maharashtrian astrological fields (Kuldaivat, Nadi, Gan, Varna) not found in any other template.",
    thumbnail: "./src/assets/thumbnails/template_11.png",
    loadSchema: () => import("./catalog/template_11/schema.js"),
    loadLayout: () => import("./catalog/template_11/layout.js"),
    styleHref: "./src/templates/catalog/template_11/style.css",
  },
  {
    id: "template_12",
    name: "Extended Family Tree",
    community: "Hindu",
    description: "Two-column layout built for dense, multi-generation family sections — Paternal Uncle/Aunt and separate Paternal/Maternal Grandparents fields, unique to this template.",
    thumbnail: "./src/assets/thumbnails/template_12.png",
    loadSchema: () => import("./catalog/template_12/schema.js"),
    loadLayout: () => import("./catalog/template_12/layout.js"),
    styleHref: "./src/templates/catalog/template_12/style.css",
  },
  {
    id: "template_13",
    name: "Chattogram Ornate",
    community: "Muslim",
    description: "Two-column teal & gold ornate frame with Nationality and Expectations fields, and siblings captured as free-form prose rather than row-per-relative.",
    thumbnail: "./src/assets/thumbnails/template_13.png",
    loadSchema: () => import("./catalog/template_13/schema.js"),
    loadLayout: () => import("./catalog/template_13/layout.js"),
    styleHref: "./src/templates/catalog/template_13/style.css",
  },
  {
    id: "template_14",
    name: "Sanskrit Vivaha Vrittapatram",
    community: "Hindu",
    description: "Clean single-column Sanskrit-language template with a Ganesh invocation header — deliberately minimal, distinct from template_11's ornate Marathi look.",
    thumbnail: "./src/assets/thumbnails/template_14.png",
    loadSchema: () => import("./catalog/template_14/schema.js"),
    loadLayout: () => import("./catalog/template_14/layout.js"),
    styleHref: "./src/templates/catalog/template_14/style.css",
  },
  {
    id: "template_15",
    name: "Noor Mahal Beliefs",
    community: "Muslim",
    description: "Modern ivory & gold card-grid biodata with a dedicated Beliefs section — Namaz frequency, Hijab-after-marriage stance and Caste preference — matching contemporary matrimonial-site formats.",
    thumbnail: "./src/assets/thumbnails/template_15.png",
    loadSchema: () => import("./catalog/template_15/schema.js"),
    loadLayout: () => import("./catalog/template_15/layout.js"),
    styleHref: "./src/templates/catalog/template_15/style.css",
  },
  {
    id: "template_16",
    name: "Blush Timeline Scholar",
    community: "General",
    description: "Pink sidebar with icon-badge contact/skills blocks and a dotted 3-step education timeline — a modern, youthful layout.",
    thumbnail: "./src/assets/thumbnails/template_16.png",
    loadSchema: () => import("./catalog/template_16/schema.js"),
    loadLayout: () => import("./catalog/template_16/layout.js"),
    styleHref: "./src/templates/catalog/template_16/style.css",
  },
  {
    id: "template_17",
    name: "Noir Portrait Editorial",
    community: "General",
    description: "Dramatic dark cinematic hero with bold stacked outline typography and icon-list highlight rows — a bold, non-traditional format.",
    thumbnail: "./src/assets/thumbnails/template_17.png",
    loadSchema: () => import("./catalog/template_17/schema.js"),
    loadLayout: () => import("./catalog/template_17/layout.js"),
    styleHref: "./src/templates/catalog/template_17/style.css",
  },
  {
    id: "template_18",
    name: "Ivory Editorial Bride",
    community: "General",
    description: "Elegant blush-ivory serif layout with a framed hero photo, italic caption line, and thin gold-divider detail rows.",
    thumbnail: "./src/assets/thumbnails/template_18.png",
    loadSchema: () => import("./catalog/template_18/schema.js"),
    loadLayout: () => import("./catalog/template_18/layout.js"),
    styleHref: "./src/templates/catalog/template_18/style.css",
  },
  {
    id: "template_19",
    name: "Charcoal Portfolio Grid",
    community: "General",
    description: "Dark charcoal theme with huge bold headline typography, neon-green accents, and boxed info cards in a two-column grid.",
    thumbnail: "./src/assets/thumbnails/template_19.png",
    loadSchema: () => import("./catalog/template_19/schema.js"),
    loadLayout: () => import("./catalog/template_19/layout.js"),
    styleHref: "./src/templates/catalog/template_19/style.css",
  },
  {
    id: "template_20",
    name: "Slate Traditional Detailed",
    community: "General",
    description: "Full-width tinted header with intro paragraph, two-tone contact bar, and a detailed two-column Personal/Education/Parents/Mosal body.",
    thumbnail: "./src/assets/thumbnails/template_20.png",
    loadSchema: () => import("./catalog/template_20/schema.js"),
    loadLayout: () => import("./catalog/template_20/layout.js"),
    styleHref: "./src/templates/catalog/template_20/style.css",
  },
  {
    id: "template_21",
    name: "Vintage Parchment Scroll",
    community: "General",
    description: "Aged parchment background with an invocation line, brown name banner, and ornate brown title-bar sections — a traditional heirloom-scroll look.",
    thumbnail: "./src/assets/thumbnails/template_21.png",
    loadSchema: () => import("./catalog/template_21/schema.js"),
    loadLayout: () => import("./catalog/template_21/layout.js"),
    styleHref: "./src/templates/catalog/template_21/style.css",
  },
  {
    id: "template_22",
    name: "Floral Botanical Sidebar",
    community: "General",
    description: "Elegant white layout with soft botanical corner flourishes, a portrait photo column, and grouped colon-list details in maroon serif type.",
    thumbnail: "./src/assets/thumbnails/template_22.png",
    loadSchema: () => import("./catalog/template_22/schema.js"),
    loadLayout: () => import("./catalog/template_22/layout.js"),
    styleHref: "./src/templates/catalog/template_22/style.css",
  },
  {
    id: "template_23",
    name: "Split Header Duo",
    community: "General",
    description: "Bold pink name panel beside the photo with an overlaid contact caption, followed by a two-column Personal Details / Family Background body.",
    thumbnail: "./src/assets/thumbnails/template_23.png",
    loadSchema: () => import("./catalog/template_23/schema.js"),
    loadLayout: () => import("./catalog/template_23/layout.js"),
    styleHref: "./src/templates/catalog/template_23/style.css",
  },
  {
    id: "template_24",
    name: "Coral Panel Profile",
    community: "General",
    description: "Bold coral color-block panel with white pill section badges beside a plain white photo column — a saturated, high-contrast alternative.",
    thumbnail: "./src/assets/thumbnails/template_24.png",
    loadSchema: () => import("./catalog/template_24/schema.js"),
    loadLayout: () => import("./catalog/template_24/layout.js"),
    styleHref: "./src/templates/catalog/template_24/style.css",
  },
];

export function getTemplateMeta(id) {
  const meta = TEMPLATE_REGISTRY.find((t) => t.id === id);
  if (!meta) throw new Error(`Unknown template id: ${id}`);
  return meta;
}

export function listTemplates() {
  return TEMPLATE_REGISTRY.map(({ id, name, description, thumbnail }) => ({
    id,
    name,
    description,
    thumbnail,
  }));
}

// --- category derivation (Issue 1 & 12) ---
// A template's filter categories are DERIVED from its `community` field —
// nothing here needs editing when a new template is added. Every non-
// "General" community is automatically also tagged "Marriage" (issue 12),
// since all religious biodatas on this site are marriage biodatas; General
// templates are left as-is (resume-style / non-marriage use is allowed).
export function getCategories(meta) {
  const community = meta.community || "General";
  return community === "General" ? [community] : [community, "Marriage"];
}

// Unique, sorted category list across the whole registry, with "All" first.
// Automatically picks up any new community introduced by a future template.
export function listCategories() {
  const set = new Set();
  TEMPLATE_REGISTRY.forEach((t) => getCategories(t).forEach((c) => set.add(c)));
  const rest = Array.from(set).sort((a, b) => (a === "Marriage") - (b === "Marriage") || a.localeCompare(b));
  return ["All", ...rest];
}