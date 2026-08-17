// sharePreview.js — GENERIC engine, works for every template unchanged.
//
// Issue 2 (WhatsApp-optimized export): this is deliberately a PREVIEW share,
// not the paid deliverable — it captures whatever's currently on screen
// (watermark included, by design: it's free, so it should stay branded and
// nudge whoever it's shared with back to Aananda Digital), compressed and
// sized the way WhatsApp actually wants images (a single JPG under ~1MB,
// object-fit contained, not a giant lossless PNG). The real, unwatermarked
// deliverable stays exactly what it already was: a *paid* PDF, generated
// server-side once backend/app/services/pdf_pipeline.py exists — this file
// never touches that flow.
//
// Uses html2canvas (loaded via CDN in index.html) to rasterize the live
// preview DOM, since there's no server round-trip available for this yet.

const MAX_WIDTH_PX = 1080; // WhatsApp comfortably displays/compresses at this width
const JPEG_QUALITY = 0.85;

async function captureElementAsJpegBlob(pageEl) {
  if (!window.html2canvas) {
    throw new Error("html2canvas failed to load — check your network/ad-blocker settings.");
  }
  const canvas = await window.html2canvas(pageEl, {
    backgroundColor: "#ffffff",
    scale: Math.min(2, MAX_WIDTH_PX / pageEl.offsetWidth),
    useCORS: true,
  });
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
}

export async function shareCurrentPreview(previewMount, templateName, overlay) {
  const pageEl = previewMount.firstElementChild;
  if (!pageEl) return overlay.fail("Nothing to share yet — fill in a few details first.");

  overlay.show("Preparing a shareable preview…");
  let blob;
  try {
    blob = await captureElementAsJpegBlob(pageEl);
  } catch (err) {
    overlay.fail("Couldn't generate a shareable image. Please try again.");
    return;
  }
  if (!blob) {
    overlay.fail("Couldn't generate a shareable image. Please try again.");
    return;
  }

  const fileName = `${(templateName || "biodata-preview").replace(/\s+/g, "-").toLowerCase()}.jpg`;
  const file = new File([blob], fileName, { type: "image/jpeg" });

  // Mobile: hands straight to the native share sheet (WhatsApp/Instagram/etc
  // all appear there automatically) — this is the primary path most users hit.
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    overlay.hide();
    try {
      await navigator.share({
        files: [file],
        title: "My biodata preview",
        text: "Here's a preview of my biodata, made with Aananda Digital.",
      });
    } catch {
      // user cancelled the share sheet — not an error, nothing to do
    }
    return;
  }

  // Desktop fallback: just download the image so it can be dragged into
  // WhatsApp Web / any chat manually.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  overlay.hide();
}
