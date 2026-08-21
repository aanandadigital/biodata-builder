import { getTemplateMeta, getCategories } from "./templates/registry.js";
import { renderGallery, setActiveCategory } from "./components/templateGallery.js";
import { renderForm, getMissingRequiredFields } from "./components/formRenderer.js";
import { renderPreview } from "./components/livePreview.js";
import { startCheckout, resumePendingOrderIfAny } from "./components/checkout.js";
import { shareCurrentPreview } from "./components/sharePreview.js";
import { calculateAge, findDobFieldId } from "./templates/schemaUtils.js";
import { initBackToTop } from "./theme.js";
import {
  state, setField, selectTemplate, backToGallery, subscribe, saveDraft, clearDraft,
  addSection, removeSection, renameSection, addFieldToSection, removeField,
  addPage, removePage, addPhoto, removePhoto, movePhoto, positionPhoto,
  setPhotoStyle, bringPhotoToFront, restartCurrentTemplate,
} from "./state.js";

// --- Theme toggle (light/dark), persisted to localStorage. Self-contained:
// applied to <html data-theme="..."> which every CSS variable in style.css
// reads from. A blocking inline script in index.html already applied the
// saved/system theme before first paint; this just wires up the button.
const THEME_KEY = "aananda-theme";
// There are now two theme-toggle buttons in the DOM (desktop header +
// mobile dropdown), both sharing the .theme-toggle class — wire them both
// up the same way; the sun/moon icon swap is already driven purely by the
// [data-theme] attribute on <html>, so no per-button state to track.
const themeToggleBtns = document.querySelectorAll(".theme-toggle");
function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  syncHeroVideos();
}
themeToggleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  });
});

// --- Mobile hamburger menu: toggles the dropdown holding nav links, theme
// toggle and the "Browse Templates" CTA once they're pulled out of the
// header bar below the 860px breakpoint (see style.css).
const navToggleBtn = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");
function closeMobileMenu() {
  if (!navToggleBtn || !mobileMenu) return;
  navToggleBtn.setAttribute("aria-expanded", "false");
  mobileMenu.hidden = true;
}
function openMobileMenu() {
  if (!navToggleBtn || !mobileMenu) return;
  navToggleBtn.setAttribute("aria-expanded", "true");
  mobileMenu.hidden = false;
}
navToggleBtn?.addEventListener("click", () => {
  const isOpen = navToggleBtn.getAttribute("aria-expanded") === "true";
  if (isOpen) closeMobileMenu(); else openMobileMenu();
});
mobileMenu?.addEventListener("click", (e) => {
  // Close after a nav link is picked, but not on the theme-toggle click
  // inside the same menu (that shouldn't dismiss the menu).
  if (e.target.closest("a")) closeMobileMenu();
});
document.addEventListener("click", (e) => {
  if (!mobileMenu || mobileMenu.hidden) return;
  if (mobileMenu.contains(e.target) || navToggleBtn?.contains(e.target)) return;
  closeMobileMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMobileMenu();
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 860) closeMobileMenu();
});

// --- Hero logo video: two <video> tags (dark/light) sit in the DOM at once;
// CSS shows/hides by data-theme, but only the visible one should actually
// play, so the hidden one isn't wasting decode/battery in the background.
// When the theme is toggled mid-clip, the newly-visible video should pick
// up from the exact same timestamp the outgoing one was at — not restart
// from 0 — so the rotation feels continuous through the switch.
function syncHeroVideos() {
  const theme = getTheme();
  const videos = document.querySelectorAll(".hero-logo-video");

  let handoffTime = 0;
  videos.forEach((video) => {
    if (!video.paused) handoffTime = video.currentTime;
  });

  videos.forEach((video) => {
    if (video.dataset.themeVideo !== theme) {
      video.pause?.();
      return;
    }
    const resumeFromHandoff = () => {
      // Wrap into this clip's own duration in case the two exports aren't
      // frame-for-frame the same length (e.g. 10.02s vs 9.98s).
      const duration = video.duration || 10;
      video.currentTime = duration > 0 ? handoffTime % duration : 0;
      video.play?.().catch(() => {}); // autoplay can reject before user interaction on some browsers; harmless
    };
    if (video.readyState >= 1) {
      resumeFromHandoff();
    } else {
      video.addEventListener("loadedmetadata", resumeFromHandoff, { once: true });
    }
  });
}
syncHeroVideos();

// --- Hero logo tap animation: a short gold pulse-ring + scale "press",
// since the video itself is a passive idle loop (see the rotate prompt) —
// the interactive feel is layered on top here instead of baked into the clip.
const heroLogoShowcase = document.getElementById("heroLogoShowcase");
function playHeroLogoTap() {
  if (!heroLogoShowcase) return;
  heroLogoShowcase.classList.remove("is-tapped");
  // Force reflow so re-adding the class restarts the animation on rapid taps.
  void heroLogoShowcase.offsetWidth;
  heroLogoShowcase.classList.add("is-tapped");
}
heroLogoShowcase?.addEventListener("click", playHeroLogoTap);
heroLogoShowcase?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    playHeroLogoTap();
  }
});
heroLogoShowcase?.addEventListener("animationend", (e) => {
  if (e.animationName === "heroLogoPulse") heroLogoShowcase.classList.remove("is-tapped");
});

// --- Back-to-top: footer link + floating fixed button (see theme.js) ---
initBackToTop();

const viewGallery = document.getElementById("view-gallery");
const viewBuilder = document.getElementById("view-builder");
const galleryGrid = document.getElementById("galleryGrid");
const formMount = document.getElementById("formMount");
const previewMount = document.getElementById("previewMount");
const previewFullscreenBtn = document.getElementById("previewFullscreenBtn");
const previewFullscreenClose = document.getElementById("previewFullscreenClose");
const previewFullscreenEl = document.getElementById("previewFullscreen");
const previewFullscreenBody = document.getElementById("previewFullscreenBody");
const previewScaleEl = document.querySelector(".preview-scale");
const previewNavEl = document.getElementById("previewNav");
const backBtn = document.getElementById("backBtn");
const restartBtn = document.getElementById("restartBtn");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");
const downloadBlockReasonEl = document.getElementById("downloadBlockReason");
const fullNameInput = document.getElementById("f_fullName");
const emailInput = document.getElementById("f_email");
const phoneInput = document.getElementById("f_phone");
const countryCodeSelect = document.getElementById("f_countryCode");
const phoneErrorEl = document.getElementById("phoneError");

// Issue 7: phone number with country code, defaulting to India.
const COUNTRY_CODES = [
  ["+91", "India (+91)", 10],
  ["+1", "USA/Canada (+1)", 10],
  ["+44", "UK (+44)", 10],
  ["+61", "Australia (+61)", 9],
  ["+971", "UAE (+971)", 9],
  ["+966", "Saudi Arabia (+966)", 9],
  ["+974", "Qatar (+974)", 8],
  ["+965", "Kuwait (+965)", 8],
  ["+968", "Oman (+968)", 8],
  ["+973", "Bahrain (+973)", 8],
  ["+92", "Pakistan (+92)", 10],
  ["+880", "Bangladesh (+880)", 10],
  ["+977", "Nepal (+977)", 10],
  ["+94", "Sri Lanka (+94)", 9],
  ["+65", "Singapore (+65)", 8],
];
countryCodeSelect.innerHTML = COUNTRY_CODES
  .map(([code, label]) => `<option value="${code}">${label}</option>`)
  .join("");
countryCodeSelect.value = "+91"; // default India

function expectedPhoneLength(code) {
  const found = COUNTRY_CODES.find(([c]) => c === code);
  return found ? found[2] : 10;
}

function validatePhone({ showError = true } = {}) {
  const digits = phoneInput.value.replace(/\D/g, "");
  const expectedLen = expectedPhoneLength(countryCodeSelect.value);
  const valid = digits.length === expectedLen;
  if (showError) {
    phoneErrorEl.textContent = valid || !digits ? "" : `Enter a valid ${expectedLen}-digit number for ${countryCodeSelect.value}.`;
  }
  return valid;
}

const overlayEl = document.getElementById("overlay");
const overlayTextEl = document.getElementById("overlayText");
const overlay = {
  show: (msg) => { overlayTextEl.textContent = msg; overlayEl.hidden = false; },
  hide: () => { overlayEl.hidden = true; },
  fail: (msg) => { overlay.hide(); alert(msg); },
};
// Let the user tap/click the overlay to dismiss it right away, instead of
// being forced to wait out whatever auto-hide timer the caller set.
overlayEl.addEventListener("click", () => overlay.hide());

// If the customer paid and then refreshed/reopened the tab before the order
// finished processing, this resumes tracking that order automatically
// instead of leaving them with no feedback and no way to check (see
// checkout.js for the full explanation).
resumePendingOrderIfAny(overlay);

// --- Full-screen preview: on mobile the sticky top-actions bar (Back/Start
// over/Share/Pay) eats a lot of vertical space and crowds out the actual
// template, so this lets the user pop just the live preview into a
// distraction-free full-screen view. Rather than re-rendering a second copy,
// it physically moves the existing .preview-scale + #previewNav nodes into
// the modal (and back on close) — same DOM elements, so every id lookup,
// event listener, and the drag/resize handlers on extra photos keep working
// untouched. A resize event is dispatched after moving so livePreview.js's
// own resize listener recalculates the scale for the new (wider) container.
const previewFullscreenAnchorBtn = previewFullscreenBtn; // preview-panel's stable anchor point
let previewFullscreenOpen = false;

function openPreviewFullscreen() {
  if (previewFullscreenOpen || !previewFullscreenEl || !previewScaleEl) return;
  previewFullscreenOpen = true;
  previewFullscreenBody.appendChild(previewScaleEl);
  if (previewNavEl) previewFullscreenBody.appendChild(previewNavEl);
  previewFullscreenEl.hidden = false;
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
}
function closePreviewFullscreen() {
  if (!previewFullscreenOpen) return;
  previewFullscreenOpen = false;
  previewFullscreenAnchorBtn?.after(previewScaleEl);
  if (previewNavEl) previewScaleEl.after(previewNavEl);
  previewFullscreenEl.hidden = true;
  document.body.style.overflow = "";
  requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
}
previewFullscreenBtn?.addEventListener("click", openPreviewFullscreen);
previewFullscreenClose?.addEventListener("click", closePreviewFullscreen);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePreviewFullscreen();
});

function showView() {
  viewGallery.hidden = state.view !== "gallery";
  viewBuilder.hidden = state.view !== "builder";
  if (state.view !== "builder") closePreviewFullscreen();
}

// Re-renders both the form panel and the live preview from current state.
// Used after any structural change (add/remove section, page, photo, field)
// since those change what the form and preview both need to display.
// Issue 1 & 7: the DOB field is found generically (findDobFieldId) instead of
// assuming every template calls it "dob" — two templates don't, and the old
// hardcoded lookup meant their age gate silently never fired. The 18+ rule
// itself is still only applied for Marriage-category templates; this stays
// business logic in main.js — formRenderer.js remains generic and just
// renders whatever { fieldId, minAge } it's handed.
function getAgeGate() {
  if (!state.templateId || !state.schema) return null;
  const fieldId = findDobFieldId(state.schema);
  if (!fieldId) return null; // this template has no validatable DOB field (e.g. free-text only)
  const isMarriageTemplate = getCategories(getTemplateMeta(state.templateId)).includes("Marriage");
  return { fieldId, minAge: isMarriageTemplate ? 18 : 0 };
}

// Issue 1: single source of truth for "is the entered age acceptable", used
// both to disable the Download button live (as the user types) and as the
// hard guard right before checkout starts. A future DOB or an implausible
// age (>120) is rejected on every template, regardless of category; the
// 18+ rule only applies when ageGate.minAge is set (Marriage templates).
function checkAgeGate() {
  const ageGate = getAgeGate();
  if (!ageGate) return { ok: true };
  const age = calculateAge(state.formData[ageGate.fieldId]);
  if (age === null) return { ok: true }; // not filled in yet — required-field check handles that separately
  if (age < 0) return { ok: false, reason: "Date of birth can't be in the future." };
  if (age > 120) return { ok: false, reason: "Date of birth doesn't look right — please double-check it." };
  if (age < ageGate.minAge) {
    return { ok: false, reason: `Age is ${age}. Only ${ageGate.minAge}+ is allowed for a marriage biodata.` };
  }
  return { ok: true };
}

// Issue 1: keeps the Download button itself disabled — not just an alert
// after the click — for as long as the entered age is invalid, so a wrong
// age can never lead to checkout in the first place.
function updateDownloadGate() {
  const { ok, reason } = checkAgeGate();
  downloadBtn.disabled = !ok;
  downloadBlockReasonEl.textContent = ok ? "" : reason;
}

function rerenderAll() {
  renderForm(formMount, state.schema, state.formData, formCallbacks, { ageGate: getAgeGate() });
  renderPreview(previewMount, state.templateId, state.schema, state.formData, formCallbacks);
  updateDownloadGate();
}

const formCallbacks = {
  onFieldChange: (fieldId, value) => {
    setField(fieldId, value);
    renderPreview(previewMount, state.templateId, state.schema, state.formData, formCallbacks);
    updateDownloadGate();
  },
  onAddSection: (pageId, title) => { addSection(pageId, title); rerenderAll(); },
  onRemoveSection: (pageId, sectionId) => { removeSection(pageId, sectionId); rerenderAll(); },
  onRenameSection: (pageId, sectionId, title) => { renameSection(pageId, sectionId, title); rerenderAll(); },
  onAddField: (pageId, sectionId, label) => { addFieldToSection(pageId, sectionId, label); rerenderAll(); },
  onRemoveField: (pageId, sectionId, fieldId) => { removeField(pageId, sectionId, fieldId); rerenderAll(); },
  onAddPage: () => { addPage(); rerenderAll(); },
  onRemovePage: (pageId) => { removePage(pageId); rerenderAll(); },
  onAddPhoto: () => { addPhoto(); rerenderAll(); },
  onRemovePhoto: (photoId) => { removePhoto(photoId); rerenderAll(); },
  onMovePhoto: (photoId, pageId) => { movePhoto(photoId, pageId); rerenderAll(); },
  onPhotoStyle: (photoId, patch) => { setPhotoStyle(photoId, patch); rerenderAll(); },
  onPhotoToFront: (photoId) => { bringPhotoToFront(photoId); rerenderAll(); },
  // Issue 2: same reorder, but called from pointerdown on the photo itself
  // (click or drag-start) — no rerenderAll, because that would replace the
  // preview's innerHTML mid-gesture and kill the drag (the pointerdown
  // handler calls el.setPointerCapture() right after this). livePreview.js
  // reorders the DOM element itself immediately for the same visual effect.
  onPhotoToFrontSilent: (photoId) => { bringPhotoToFront(photoId); },
  // Drag/resize on the preview: persist only, no re-render (avoids flicker —
  // the preview DOM already reflects the new position live during the drag).
  onPhotoPosition: (photoId, pos) => { positionPhoto(photoId, pos); },
};

async function onSelectTemplate(templateId, { updateHash = true } = {}) {
  const meta = getTemplateMeta(templateId);
  const { schema } = await meta.loadSchema();
  selectTemplate(templateId, schema);
  showView();

  fullNameInput.value = state.fullName;
  emailInput.value = state.email;
  phoneInput.value = state.phone || "";
  countryCodeSelect.value = state.countryCode || "+91";
  phoneErrorEl.textContent = "";

  if (updateHash) location.hash = `#/${templateId}`;

  renderForm(formMount, state.schema, state.formData, formCallbacks, { ageGate: getAgeGate() });
  await renderPreview(previewMount, state.templateId, state.schema, state.formData, formCallbacks);
  updateDownloadGate();
}

fullNameInput.addEventListener("input", (e) => { state.fullName = e.target.value; saveDraft(); });
emailInput.addEventListener("input", (e) => { state.email = e.target.value; saveDraft(); });
phoneInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "");
  state.phone = e.target.value;
  saveDraft();
  validatePhone();
});
countryCodeSelect.addEventListener("change", (e) => {
  state.countryCode = e.target.value;
  saveDraft();
  validatePhone();
});

backBtn.addEventListener("click", () => {
  backToGallery();
  showView();
  history.pushState(null, "", location.pathname);
});

// Issue 2: Start over — clears the draft and restores this template to its
// pristine, un-edited state without leaving the builder.
restartBtn.addEventListener("click", async () => {
  if (!state.templateId) return;
  if (!confirm("Start over? This clears everything you've entered for this biodata.")) return;
  const meta = getTemplateMeta(state.templateId);
  const { schema } = await meta.loadSchema();
  restartCurrentTemplate(schema);
  fullNameInput.value = "";
  emailInput.value = "";
  phoneInput.value = "";
  countryCodeSelect.value = "+91";
  phoneErrorEl.textContent = "";
  renderForm(formMount, state.schema, state.formData, formCallbacks, { ageGate: getAgeGate() });
  await renderPreview(previewMount, state.templateId, state.schema, state.formData, formCallbacks);
  updateDownloadGate();
});

subscribe(() => {});

shareBtn.addEventListener("click", () => {
  shareCurrentPreview(previewMount, getTemplateMeta(state.templateId)?.name, overlay);
});

downloadBtn.addEventListener("click", () => {
  const missing = getMissingRequiredFields(state.schema, state.formData);
  if (missing.length) {
    overlay.fail(`Please fill in: ${missing.join(", ")}`);
    return;
  }

  if (!validatePhone()) {
    overlay.fail(phoneInput.value ? phoneErrorEl.textContent || "Please enter a valid phone number." : "Please add your phone number before downloading.");
    return;
  }

  // Issue 1: same check that already keeps the button disabled — kept here
  // too as a hard guard (belt-and-suspenders) in case this ever fires
  // through something other than a direct click on an enabled button.
  const { ok, reason } = checkAgeGate();
  if (!ok) {
    overlay.fail(reason);
    return;
  }

  startCheckout(
    {
      email: state.email,
      fullName: state.fullName,
      phone: `${state.countryCode || "+91"} ${state.phone || ""}`.trim(),
      community: getTemplateMeta(state.templateId).community,
      templateId: state.templateId,
      formData: state.formData,
      // The backend needs the LIVE (possibly mutated) schema — custom
      // sections/pages/extra photos the user added — not just formData,
      // or the paid PDF silently drops anything added at runtime.
      schema: state.schema,
    },
    overlay
  );
  // Optional: clearDraft(state.templateId) after a *confirmed* successful order,
  // inside checkout.js's success callback — not here, in case payment fails.
});

// --- hash routing: deep link + refresh survival ---
function routeFromHash() {
  const match = location.hash.match(/^#\/(.+)$/);
  if (match) {
    try {
      onSelectTemplate(match[1], { updateHash: false });
      return;
    } catch {
      // unknown template id in hash — fall through to gallery
    }
  }
  backToGallery();
  showView();
}

window.addEventListener("hashchange", routeFromHash);

// Deep link into a filtered gallery category, e.g. index.html?cat=Marriage#galleryGrid
// (used by the footer's "Categories" links). Separate from the #/templateId
// hash router below on purpose — a query param can't collide with it.
const catParam = new URLSearchParams(location.search).get("cat");
if (catParam) setActiveCategory(catParam);

renderGallery(galleryGrid, (id) => onSelectTemplate(id));
routeFromHash(); // handles initial load, including a refresh mid-builder

if (catParam) {
  document.getElementById("galleryGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
}