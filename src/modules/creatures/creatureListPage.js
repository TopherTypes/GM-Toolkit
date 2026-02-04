import { createElement } from "../../ui/dom.js";
import { createListView } from "../../ui/components/ListView.js";
import { createCreatureForm } from "./creatureForm.js";
import { createId } from "../../utils/ids.js";
import { nowIso } from "../../utils/dates.js";
import { routes } from "../../router/routes.js";

// Creature list page with search, filters, and create flow.
export const renderCreatureListPage = ({ app, campaignId, campaign }) => {
  const container = createElement("div", { className: "form-grid" });
  const header = createElement("div", { className: "card" });
  const listCard = createElement("div", { className: "card" });
  const listView = createListView();

  const searchInput = createElement("input", {
    className: "input",
    attrs: { type: "search", placeholder: "Search creatures and press Enter", "aria-label": "Creature search" },
  });
  const searchButton = createElement("button", {
    className: "button secondary",
    text: "Search",
    attrs: { type: "button" },
  });
  const clearButton = createElement("button", {
    className: "button secondary",
    text: "Clear",
    attrs: { type: "button" },
  });
  const tagFilter = createElement("input", {
    className: "input",
    attrs: { type: "text", placeholder: "Filter by tag", "aria-label": "Filter by tag" },
  });
  const sortSelect = createElement("select", {
    className: "select",
    attrs: { "aria-label": "Sort creatures" },
  });
  [
    { value: "name", label: "Sort by name" },
    { value: "updated", label: "Sort by last updated" },
  ].forEach((option) => {
    sortSelect.append(createElement("option", { text: option.label, attrs: { value: option.value } }));
  });

  const showArchivedToggle = createElement("input", {
    attrs: { type: "checkbox", "aria-label": "Show archived" },
  });
  const archivedStateBadge = createElement("span", { className: "badge", text: "Showing archived: OFF" });
  const searchSummary = createElement("p", { className: "text-muted search-summary", text: "" });

  let searchQuery = "";
  showArchivedToggle.checked = Boolean(app.settings?.get?.().showArchivedByDefault);

  const updateArchivedState = () => {
    const isOn = showArchivedToggle.checked;
    archivedStateBadge.textContent = `Showing archived: ${isOn ? "ON" : "OFF"}`;
    archivedStateBadge.className = isOn ? "badge warning" : "badge";
  };

  // Track search, tag, and archived filters for clearer list feedback.
  const updateSearchSummary = (visibleCount, totalCount) => {
    const parts = [];
    if (searchQuery) {
      parts.push(`search: “${searchQuery}”`);
    }
    if (tagFilter.value.trim()) {
      parts.push(`tag: ${tagFilter.value.trim()}`);
    }
    if (showArchivedToggle.checked) {
      parts.push("including archived");
    }
    const filterText = parts.length ? parts.join(" • ") : "no filters";
    searchSummary.textContent = `Showing ${visibleCount} of ${totalCount} creatures (${filterText}).`;
    clearButton.disabled = !searchQuery && !tagFilter.value.trim();
  };

  const refresh = () => {
    const creatures = Object.values(campaign.creatures || {});
    const filtered = creatures.filter((creature) => {
      if (!showArchivedToggle.checked && creature.isArchived) {
        return false;
      }
      if (searchQuery) {
        const haystack = `${creature.name} ${creature.type} ${creature.statBlock || ""} ${(creature.tags || []).join(" ")}`.toLowerCase();
        if (!haystack.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      if (tagFilter.value.trim()) {
        const tag = tagFilter.value.trim().toLowerCase();
        if (!creature.tags?.map((item) => item.toLowerCase()).includes(tag)) {
          return false;
        }
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortSelect.value === "updated") {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }
      return a.name.localeCompare(b.name);
    });

    listView.setItems(
      sorted.map((creature) => ({
        title: creature.name,
        meta: [creature.type, creature.cr ? `CR ${creature.cr}` : ""].filter(Boolean).join(" • "),
        isArchived: creature.isArchived,
        badges: [
          ...(creature.status === "wip" ? [{ text: "WIP", variant: "warning" }] : []),
          ...(creature.isArchived ? [{ text: "ARCHIVED", variant: "muted" }] : []),
        ],
        onClick: () => {
          window.location.hash = routes.creatureDetail(campaignId, creature.id);
        },
      })),
      {
        emptyState: {
          title: "No creatures yet",
          description: "Add a creature to start assembling encounters.",
          actionLabel: "Create creature",
          onAction: () => openCreateCreatureModal(),
        },
      }
    );
    updateSearchSummary(filtered.length, creatures.length);
  };

  const applySearch = () => {
    searchQuery = searchInput.value.trim();
    refresh();
  };

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      applySearch();
    }
  });
  searchButton.addEventListener("click", applySearch);
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    tagFilter.value = "";
    searchQuery = "";
    refresh();
  });
  tagFilter.addEventListener("input", refresh);
  sortSelect.addEventListener("change", refresh);
  showArchivedToggle.addEventListener("change", () => {
    updateArchivedState();
    refresh();
  });

  const newCreatureButton = createElement("button", {
    className: "button",
    text: "Create creature",
    attrs: { type: "button" },
  });

  const openCreateCreatureModal = () => {
    const form = createCreatureForm({
      onSubmit: async ({ data, xpUnknown }) => {
        if (!data.name || !data.type || !data.cr) {
          app.banners.show("Name, type, and CR are required.", "error");
          return;
        }
        if (xpUnknown) {
          app.banners.show("CR not recognized. XP saved as 0.", "warning");
        }
        const timestamp = nowIso();
        const creature = {
          id: createId("crt"),
          campaignId,
          ...data,
          createdAt: timestamp,
          updatedAt: timestamp,
          isArchived: false,
          archivedAt: null,
        };
        await app.campaignStore.addCreature(creature);
        app.modal.close();
        window.location.hash = routes.creatureDetail(campaignId, creature.id);
      },
      onCancel: () => app.modal.close(),
      tagSuggestions: app.searchService.suggestTags({ scopes: ["creatures"] }),
      variantOptions: Object.values(campaign.creatures || {}).filter((entry) => !entry.isArchived),
    });
    form.append(
      createElement("button", { className: "button", text: "Save", attrs: { type: "submit" } })
    );
    app.modal.open({ title: "Create creature", content: form, actions: [] });
  };

  newCreatureButton.addEventListener("click", () => {
    openCreateCreatureModal();
  });

  header.append(
    createElement("h1", { text: "Creatures" }),
    createElement("div", {
      className: "form-row inline",
      children: [searchInput, searchButton, clearButton, tagFilter, sortSelect],
    }),
    createElement("div", {
      className: "form-row inline",
      children: [
        createElement("label", { text: "Show archived", children: [showArchivedToggle] }),
        archivedStateBadge,
      ],
    }),
    searchSummary,
    newCreatureButton
  );

  listCard.append(listView.element);

  updateArchivedState();
  container.append(header, listCard);
  refresh();

  return container;
};
