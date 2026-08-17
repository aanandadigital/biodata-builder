# app/templates_registry.py
# Server-side mirror of the frontend's TEMPLATE_REGISTRY ids (see
# frontend/src/templates/registry.js) — used only to reject an unknown
# template_id early with a clean 400 instead of letting it fail deep inside
# the Node render step. Intentionally just the id set, nothing else: the
# actual per-template layout/schema/style all live in the frontend catalog
# and are read directly from there at render time (see render/render.mjs),
# so this list is the ONE place to update if templates are ever renumbered.
VALID_TEMPLATE_IDS = {f"template_{i:02d}" for i in range(1, 25)}
