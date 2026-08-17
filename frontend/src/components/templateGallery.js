// templateGallery.js — GENERIC engine.
// Renders every entry in the registry as a card, plus a category filter bar
// derived automatically from each template's `community` (see registry.js
// getCategories/listCategories). Adding a template with a brand-new
// community value adds a new filter chip by itself — nothing here needs
// editing when the catalog changes.

import { TEMPLATE_REGISTRY, getCategories, listCategories } from "../templates/registry.js";

let activeCategory = "All";

// Lets callers (e.g. deep-linked "?cat=Marriage" URLs) set the starting
// filter before the first render. Falls back to "All" for an unknown value
// so a bad/old link never renders an empty gallery.
export function setActiveCategory(category) {
  activeCategory = listCategories().includes(category) ? category : "All";
}

export function renderGallery(container, onSelect) {
  container.innerHTML = "";

  const filterBar = document.createElement("div");
  filterBar.className = "gallery-filters";
  listCategories().forEach((cat) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "filter-chip" + (cat === activeCategory ? " active" : "");
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      activeCategory = cat;
      renderGallery(container, onSelect);
    });
    filterBar.appendChild(chip);
  });
  container.appendChild(filterBar);

  const grid = document.createElement("div");
  grid.className = "gallery-grid";

  const visible =
    activeCategory === "All"
      ? TEMPLATE_REGISTRY
      : TEMPLATE_REGISTRY.filter((meta) => getCategories(meta).includes(activeCategory));

  if (!visible.length) {
    grid.innerHTML = `<div class="gallery-empty">No templates in this category yet.</div>`;
  }

  visible.forEach((meta) => {
    const isGeneral = (meta.community || "General") === "General";
    const badgeLabel = isGeneral ? "General / Job" : "Marriage / Traditional";
    const badgeClass = isGeneral ? "badge-general" : "badge-marriage";

    const card = document.createElement("div");
    card.className = "template-card";
    card.innerHTML = `
      <div class="template-card-thumb">
        <span class="template-card-badge ${badgeClass}">${badgeLabel}</span>
        <img src="${meta.thumbnail}" alt="${meta.name}" onerror="this.style.display='none'; this.parentElement.classList.add('no-thumb');" />
        <div class="template-card-overlay">
          <span class="template-card-overlay-btn">Preview &amp; Edit</span>
        </div>
      </div>
      <div class="template-card-body">
        <div class="template-card-name">${meta.name}</div>
        <div class="template-card-community">${meta.community || ""}</div>
        <div class="template-card-desc">${meta.description || ""}</div>
        <button type="button" class="btn btn-primary">Use this template</button>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => onSelect(meta.id));
    card.querySelector(".template-card-thumb").addEventListener("click", () => onSelect(meta.id));
    grid.appendChild(card);
  });

  container.appendChild(grid);
}