import { createElement } from "../../ui/dom.js";
import { createListView } from "../../ui/components/ListView.js";
import { createItemForm } from "./itemForm.js";
import { createId } from "../../utils/ids.js";
import { nowIso } from "../../utils/dates.js";
import { routes } from "../../router/routes.js";
import { normalizePassphrase } from "./passphraseService.js";

// Item list page with search, filters, and create flow.
export const renderItemListPage = ({ app, campaignId, campaign }) => {
  const container = createElement("div", { className: "form-grid" });
  const header = createElement("div", { className: "card" });
  const listCard = createElement("div", { className: "card" });
  const listView = createListView();

  const searchInput = createElement("input", {
    className: "input",
    attrs: { type: "search", placeholder: "Search items and press Enter", "aria-label": "Item search" },
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
    attrs: { "aria-label": "Sort items" },
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

  // Summarize active filters so the list remains predictable.
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
    searchSummary.textContent = `Showing ${visibleCount} of ${totalCount} items (${filterText}).`;
    clearButton.disabled = !searchQuery && !tagFilter.value.trim();
  };

  const refresh = () => {
    const items = Object.values(campaign.items || {});
    const filtered = items.filter((item) => {
      if (!showArchivedToggle.checked && item.isArchived) {
        return false;
      }
      if (searchQuery) {
        const haystack = `${item.name} ${item.description || ""} ${item.details || ""} ${item.notes || ""} ${item.passphrase || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
        if (!haystack.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      if (tagFilter.value.trim()) {
        const tag = tagFilter.value.trim().toLowerCase();
        if (!item.tags?.map((entry) => entry.toLowerCase()).includes(tag)) {
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
      sorted.map((item) => {
        const descriptionSnippet = item.description?.trim().slice(0, 80);
        const metaParts = [item.passphrase ? `"${item.passphrase}"` : "No passphrase", descriptionSnippet]
          .filter(Boolean)
          .map((entry) => entry.trim())
          .filter(Boolean);
        return {
          title: item.name,
          meta: metaParts.join(" • "),
          isArchived: item.isArchived,
          badges: item.isArchived ? [{ text: "ARCHIVED", variant: "muted" }] : [],
          onClick: () => {
            window.location.hash = routes.itemDetail(campaignId, item.id);
          },
        };
      }),
      {
        emptyState: {
          title: "No items yet",
          description: "Add items to generate printable cards and handouts.",
          actionLabel: "Create item",
          onAction: () => openCreateItemModal(),
        },
      }
    );
    updateSearchSummary(filtered.length, items.length);
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

  const newItemButton = createElement("button", {
    className: "button",
    text: "Create item",
    attrs: { type: "button" },
  });

  const openCreateItemModal = () => {
    const existingPassphrases = Object.values(campaign.items || {}).map((entry) => entry.passphrase);
    const form = createItemForm({
      existingPassphrases,
      onPassphraseMessage: (message) => app.banners.show(message, "info"),
      onSubmit: async (data) => {
        if (!data.name) {
          app.banners.show("Item name is required.", "error");
          return;
        }
        if (!data.passphrase) {
          app.banners.show("Passphrase is required.", "error");
          return;
        }
        const normalizedPassphrase = normalizePassphrase(data.passphrase);
        const collision = existingPassphrases
          .map((entry) => normalizePassphrase(entry))
          .includes(normalizedPassphrase);
        if (collision) {
          app.banners.show("That passphrase is already used in this campaign.", "error");
          return;
        }
        const timestamp = nowIso();
        const item = {
          id: createId("itm"),
          campaignId,
          ...data,
          passphrase: normalizedPassphrase,
          createdAt: timestamp,
          updatedAt: timestamp,
          isArchived: false,
          archivedAt: null,
        };
        await app.campaignStore.addItem(item);
        app.modal.close();
        window.location.hash = routes.itemDetail(campaignId, item.id);
      },
      onCancel: () => app.modal.close(),
      tagSuggestions: app.searchService.suggestTags({ scopes: ["items"] }),
    });
    form.append(createElement("button", { className: "button", text: "Save", attrs: { type: "submit" } }));
    app.modal.open({ title: "Create item", content: form, actions: [] });
  };

  newItemButton.addEventListener("click", () => {
    openCreateItemModal();
  });

  header.append(
    createElement("h1", { text: "Items" }),
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
    newItemButton
  );

  listCard.append(listView.element);

  updateArchivedState();
  container.append(header, listCard);
  refresh();

  return container;
};
