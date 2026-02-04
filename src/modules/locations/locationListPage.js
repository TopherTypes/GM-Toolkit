import { createElement } from "../../ui/dom.js";
import { createListView } from "../../ui/components/ListView.js";
import { createLocationForm } from "./locationForm.js";
import { createId } from "../../utils/ids.js";
import { nowIso } from "../../utils/dates.js";
import { routes } from "../../router/routes.js";

// Location list page with search, filters, and create flow.
export const renderLocationListPage = ({ app, campaignId, campaign }) => {
  const container = createElement("div", { className: "form-grid" });
  const header = createElement("div", { className: "card" });
  const listCard = createElement("div", { className: "card" });
  const listView = createListView();

  const searchInput = createElement("input", {
    className: "input",
    attrs: {
      type: "search",
      placeholder: "Search locations and press Enter",
      "aria-label": "Location search",
    },
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
    attrs: { "aria-label": "Sort locations" },
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

  // Keep list context visible when filters are applied.
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
    searchSummary.textContent = `Showing ${visibleCount} of ${totalCount} locations (${filterText}).`;
    clearButton.disabled = !searchQuery && !tagFilter.value.trim();
  };

  const resolveParentName = (location) => {
    if (!location.parentLocationId) {
      return "Top-level";
    }
    return campaign.locations?.[location.parentLocationId]?.name || "Unknown parent";
  };

  const refresh = () => {
    const locations = Object.values(campaign.locations || {});
    const filtered = locations.filter((location) => {
      if (!showArchivedToggle.checked && location.isArchived) {
        return false;
      }
      if (searchQuery) {
        const haystack = `${location.name} ${location.description} ${(location.tags || []).join(" ")}`.toLowerCase();
        if (!haystack.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      if (tagFilter.value.trim()) {
        const tag = tagFilter.value.trim().toLowerCase();
        if (!location.tags?.map((value) => value.toLowerCase()).includes(tag)) {
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
      sorted.map((location) => {
        const description = location.description?.trim();
        const metaParts = [resolveParentName(location)];
        if (description) {
          metaParts.push(description.slice(0, 80));
        }
        return {
          title: location.name,
          meta: metaParts.filter(Boolean).join(" • "),
          isArchived: location.isArchived,
          badges: location.isArchived ? [{ text: "ARCHIVED", variant: "muted" }] : [],
          onClick: () => {
            window.location.hash = routes.locationDetail(campaignId, location.id);
          },
        };
      }),
      {
        emptyState: {
          title: "No locations yet",
          description: "Capture key locations to reference during sessions.",
          actionLabel: "Create location",
          onAction: () => openCreateLocationModal(),
        },
      }
    );
    updateSearchSummary(filtered.length, locations.length);
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

  const newLocationButton = createElement("button", {
    className: "button",
    text: "Create location",
    attrs: { type: "button" },
  });

  const openCreateLocationModal = () => {
    const form = createLocationForm({
      locations: Object.values(campaign.locations || {}),
      onSubmit: async (data) => {
        if (!data.name) {
          app.banners.show("Location name is required.", "error");
          return;
        }
        const timestamp = nowIso();
        const location = {
          id: createId("loc"),
          campaignId,
          ...data,
          createdAt: timestamp,
          updatedAt: timestamp,
          isArchived: false,
          archivedAt: null,
        };
        await app.campaignStore.addLocation(location);
        app.modal.close();
        window.location.hash = routes.locationDetail(campaignId, location.id);
      },
      onCancel: () => app.modal.close(),
      tagSuggestions: app.searchService.suggestTags({ scopes: ["locations"] }),
    });
    form.append(createElement("button", { className: "button", text: "Save", attrs: { type: "submit" } }));
    app.modal.open({ title: "Create location", content: form, actions: [] });
  };

  newLocationButton.addEventListener("click", () => {
    openCreateLocationModal();
  });

  header.append(
    createElement("h1", { text: "Locations" }),
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
    newLocationButton
  );

  listCard.append(listView.element);

  updateArchivedState();
  container.append(header, listCard);
  refresh();

  return container;
};
