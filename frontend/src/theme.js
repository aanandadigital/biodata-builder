// theme.js — shared dark/light theme toggle + back-to-top wiring.
// Used by main.js (builder app) and every static legal page, so the toggle
// behaves identically everywhere and there's exactly one place that owns
// the localStorage key.

const THEME_KEY = "aananda-theme";

export function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  document.dispatchEvent(new CustomEvent("aananda:themechange", { detail: { theme } }));
}

// Wires up the #themeToggle button, if present on the page. The initial
// theme itself is already applied by the blocking inline script in
// <head> (before first paint) — this only handles the click.
export function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  });
}

// Plain window.scrollTo({behavior:"smooth"}) silently no-ops in some in-app
// browsers (WhatsApp/Instagram webviews, older iOS Safari), which is where
// this is often triggered from after a share. Feature-detect and fall back
// to a manual rAF-based scroll so it always works.
function scrollToTop() {
  const supportsSmooth = "scrollBehavior" in document.documentElement.style;
  if (supportsSmooth) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const step = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y <= 0) return;
    window.scrollTo(0, Math.max(y - Math.ceil(y / 8), 0));
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Wires up the #backToTop footer link (if present) AND injects a floating,
// fixed-position back-to-top button that appears as soon as the page is
// scrolled down a little — reachable from anywhere, not just once you've
// scrolled all the way down to the footer.
export function initBackToTop() {
  const footerBtn = document.getElementById("backToTop");
  footerBtn?.addEventListener("click", scrollToTop);

  if (document.getElementById("scrollTopFab")) return; // already injected
  const fab = document.createElement("button");
  fab.type = "button";
  fab.id = "scrollTopFab";
  fab.className = "scroll-top-fab";
  fab.setAttribute("aria-label", "Back to top");
  fab.innerHTML = "&uarr;";
  fab.addEventListener("click", scrollToTop);
  document.body.appendChild(fab);

  const SHOW_AFTER = 320;
  const toggle = () => {
    fab.classList.toggle("is-visible", (window.scrollY || document.documentElement.scrollTop) > SHOW_AFTER);
  };
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

export function initFooterYear() {
  const el = document.getElementById("footerYear");
  if (el) el.textContent = new Date().getFullYear();
}
