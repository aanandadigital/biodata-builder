# app/services/pdf_generator.py
import json
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

from app.config import get_settings

settings = get_settings()

# render/render.mjs, resolved relative to this file unless overridden via
# RENDER_SCRIPT_PATH (e.g. a differently-laid-out deployment).
# In the Docker image (see backend/Dockerfile), this file lives at
# /app/app/services/pdf_generator.py and render.mjs lives at
# /app/render/render.mjs — two levels up from this file's directory, not
# three.
DEFAULT_RENDER_SCRIPT_PATH = Path(__file__).resolve().parents[2] / "render" / "render.mjs"


class PdfGenerationError(Exception):
    """Raised when HTML rendering or PDF conversion fails."""
    pass


def render_biodata_html(template_id: str, form_data: dict, schema_snapshot: dict | None) -> str:
    """
    Runs render/render.mjs, which imports the FRONTEND's own
    layout.js/schema.js/dynamicExtras.js/style.css for `template_id` and
    produces the exact same markup the live preview would show — minus the
    watermark — from the order's stored biodata_data/schema_snapshot. This
    never touches anything the browser sent after payment; it's rebuilt
    entirely from what was snapshotted onto the Order at checkout time.

    See render/render.mjs's module docstring for why this reuses the
    frontend's modules directly instead of a ported Jinja/Python template
    per design.
    """
    script_path = Path(settings.RENDER_SCRIPT_PATH) if settings.RENDER_SCRIPT_PATH else DEFAULT_RENDER_SCRIPT_PATH
    if not script_path.exists():
        raise PdfGenerationError(f"Render script not found at {script_path}")

    payload = json.dumps({
        "templateId": template_id,
        "formData": form_data or {},
        "schema": schema_snapshot,
    })

    try:
        result = subprocess.run(
            [settings.NODE_BINARY, str(script_path)],
            input=payload,
            capture_output=True,
            text=True,
            timeout=settings.RENDER_TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired as exc:
        raise PdfGenerationError(f"Template render timed out for {template_id}") from exc
    except OSError as exc:
        raise PdfGenerationError(f"Could not start Node render process: {exc}") from exc

    if result.returncode != 0:
        raise PdfGenerationError(
            f"Template render failed for {template_id}: {result.stderr.strip() or 'unknown error'}"
        )

    html_content = result.stdout
    if not html_content.strip():
        raise PdfGenerationError(f"Template render produced empty output for {template_id}")

    return html_content


def generate_pdf_bytes(html_content: str) -> bytes:
    """
    Converts rendered HTML into PDF bytes using headless Chromium via
    Playwright. Runs synchronously and is meant to be called from a
    background task/worker, not directly inside a request handler.

    prefer_css_page_size honors the `@page { size: ...px ...px }` rule that
    render.mjs writes into the document — the templates' own fixed
    735x1040 page dimensions — rather than forcing a generic paper size.
    """
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(args=["--no-sandbox", "--disable-dev-shm-usage"])
            try:
                page = browser.new_page()
                page.set_content(html_content, wait_until="networkidle")
                pdf_bytes = page.pdf(
                    margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
                    print_background=True,
                    prefer_css_page_size=True,
                )
                return pdf_bytes
            finally:
                browser.close()
    except Exception as exc:
        raise PdfGenerationError(f"Failed to generate PDF: {exc}") from exc


def generate_biodata_pdf(template_id: str, form_data: dict, schema_snapshot: dict | None) -> bytes:
    """Convenience wrapper: order fields -> final PDF bytes, in one call."""
    html_content = render_biodata_html(template_id, form_data, schema_snapshot)
    return generate_pdf_bytes(html_content)