// themes.js — visual identity extracted from each template's own style.css.
// Used ONLY by the generic engine (dynamicExtras.js/livePreview.js) so that
// pages/sections/photos the user adds at runtime inherit the same colors,
// font and border as the template's own hardcoded design — instead of a
// generic unstyled box. Never edited when a template's core design changes
// only if that design's palette changes.

export const THEMES = {
  template_01: { bg: "#efece6", text: "#2b2b2b", font: "\"Georgia\", \"Times New Roman\", serif", border: "2px solid #3a3a3a", accent: "#3a3a3a" },
  template_02: { bg: "#eef6f0", text: "#1f2d24", font: "\"Georgia\", \"Times New Roman\", serif", border: "18px solid #2f7a44", accent: "#2f7a44" },
  template_03: { bg: "#5c0f14", text: "#f3e6c8", font: "\"Georgia\", \"Times New Roman\", serif", border: null, accent: "#e9c979" },
  template_04: { bg: "#1b2947", text: "#e9ecf5", font: "\"Georgia\", \"Times New Roman\", serif", border: "10px solid #c9a24b", accent: "#c9a24b" },
  template_05: { bg: "#ece4d4", text: "#3a2e22", font: "\"Georgia\", \"Times New Roman\", serif", border: "8px solid #a8461f", accent: "#a8461f" },
  template_06: { bg: "#fbe4ea", text: "#4a3b3f", font: "\"Georgia\", \"Times New Roman\", serif", border: "10px double #c9954f", accent: "#c9954f" },
  template_07: { bg: "#ffffff", text: "#111111", font: "\"Georgia\", \"Times New Roman\", serif", border: "14px solid #111111", accent: "#999" },
  template_08: { bg: "#7fd0e8", text: "#0f3b4d", font: "\"Georgia\", \"Times New Roman\", serif", border: "10px solid #ffffff", accent: "#ffffff" },
  template_09: { bg: "#fdfaf2", text: "#2e2a1f", font: "\"Georgia\", \"Times New Roman\", serif", border: "6px solid #b3852c", accent: "#b3852c" },
  template_10: { bg: "#12283a", text: "#e8eef2", font: "\"Helvetica Neue\", Arial, sans-serif", border: null, accent: "#e0a83e" },
  template_11: { bg: "#fff8f0", text: "#3a2418", font: "\"Noto Sans Devanagari\", \"Nirmala UI\", \"Georgia\", serif", border: "5px solid #b5261f", accent: "#b5261f" },
  template_12: { bg: "#fbf4ea", text: "#3a2e22", font: "\"Helvetica Neue\", Arial, sans-serif", border: null, accent: "#d9c19a" },
  template_13: { bg: "#fdfcf6", text: "#2c2418", font: "\"Georgia\", \"Times New Roman\", serif", border: "14px solid #0d6b6b", accent: "#0d6b6b" },
  template_14: { bg: "#ffffff", text: "#24331f", font: "\"Noto Sans Devanagari\", \"Nirmala UI\", \"Georgia\", serif", border: "10px solid #2c6e3f", accent: "#2c6e3f" },
  template_15: { bg: "#fffaf3", text: "#3a2f27", font: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif", border: null, accent: "#c9973f" },
  template_16: { bg: "#ffffff", text: "#2b2320", font: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif", border: null, accent: "#3a2e2a" },
  template_17: { bg: "#141414", text: "#f2f0ec", font: "\"Helvetica Neue\", Arial, sans-serif", border: null, accent: "#b7b3ac" },
  template_18: { bg: "#f6ece4", text: "#3a3229", font: "Georgia, \"Times New Roman\", serif", border: null, accent: "#9c8a76" },
  template_19: { bg: "#3a3a3a", text: "#f0f0f0", font: "\"Helvetica Neue\", Arial, sans-serif", border: null, accent: "#7ee08a" },
  template_20: { bg: "#ffffff", text: "#2c2620", font: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif", border: null, accent: "#4c6a80" },
  template_21: { bg: "radial-gradient(ellipse at 20% 15%, rgba(180, 150, 100, 0.10), transparent 40%),\n    radial-gradient(ellipse at 85% 80%, rgba(150, 120, 80, 0.12), transparent 45%),\n    #f1e6cf", text: "#3d2e1f", font: "Georgia, \"Times New Roman\", serif", border: "10px solid #f1e6cf", accent: "#6b4423" },
  template_22: { bg: "#ffffff", text: "#3a2b2b", font: "Georgia, \"Times New Roman\", serif", border: null, accent: "#7a2e42" },
  template_23: { bg: "#ffffff", text: "#3a2f2f", font: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif", border: null, accent: "#6b2c42" },
  template_24: { bg: "#ffffff", text: "#2f2626", font: "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif", border: null, accent: "#2f2020" },
};

export function getTheme(templateId) {
  return THEMES[templateId] || { bg: "#ffffff", text: "#222222", font: "Georgia, serif", border: "1px solid #ccc", accent: "#555555" };
}