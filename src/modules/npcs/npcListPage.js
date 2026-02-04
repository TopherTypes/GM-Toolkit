import { createElement } from "../../ui/dom.js";
import { createListView } from "../../ui/components/ListView.js";
import { createNpcForm } from "./npcForm.js";
import { createId } from "../../utils/ids.js";
import { nowIso } from "../../utils/dates.js";
import { routes } from "../../router/routes.js";

// NPC list page with search, filter, and create flow.
export const renderNpcListPage = ({ app, campaignId, campaign }) => {
  const container = createElement("div", { className: "form-grid" });
  const header = createElement("div", { className: "card" });
  const listCard = createElement("div", { className: "card" });
  const listView = createListView();

  const searchInput = createElement("input", {
    className: "input",
    attrs: { type: "search", placeholder: "Search NPCs and press Enter", "aria-label": "NPC search" },
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
    attrs: { "aria-label": "Sort NPCs" },
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

  // Provide at-a-glance clarity on which filters are active.
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
    searchSummary.textContent = `Showing ${visibleCount} of ${totalCount} NPCs (${filterText}).`;
    clearButton.disabled = !searchQuery && !tagFilter.value.trim();
  };

  const refresh = () => {
    const npcs = Object.values(campaign.npcs || {});
    const filtered = npcs.filter((npc) => {
      if (!showArchivedToggle.checked && npc.isArchived) {
        return false;
      }
      if (searchQuery) {
        const haystack = `${npc.name} ${npc.notes} ${(npc.tags || []).join(" ")}`.toLowerCase();
        if (!haystack.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      if (tagFilter.value.trim()) {
        const tag = tagFilter.value.trim().toLowerCase();
        if (!npc.tags?.map((t) => t.toLowerCase()).includes(tag)) {
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
      sorted.map((npc) => ({
        title: npc.name,
        meta: [npc.role, npc.class, `Level ${npc.level}`].filter(Boolean).join(" • "),
        isArchived: npc.isArchived,
        badges: [
          ...(npc.status === "wip" ? [{ text: "WIP", variant: "warning" }] : []),
          ...(npc.isArchived ? [{ text: "ARCHIVED", variant: "muted" }] : []),
        ],
        onClick: () => {
          window.location.hash = routes.npcDetail(campaignId, npc.id);
        },
      })),
      {
        emptyState: {
          title: "No NPCs yet",
          description: "Create your first NPC to start building session prep notes.",
          actionLabel: "Create NPC",
          onAction: () => openCreateNpcModal(),
        },
      }
    );
    updateSearchSummary(filtered.length, npcs.length);
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

  const newNpcButton = createElement("button", {
    className: "button",
    text: "Create NPC",
    attrs: { type: "button" },
  });

  const openCreateNpcModal = () => {
    const form = createNpcForm({
      onSubmit: async (data) => {
        if (!data.name) {
          app.banners.show("NPC name is required.", "error");
          return;
        }
        const timestamp = nowIso();
        const npc = {
          id: createId("npc"),
          campaignId,
          ...data,
          status: data.status || "complete",
          createdAt: timestamp,
          updatedAt: timestamp,
          isArchived: false,
          archivedAt: null,
        };
        await app.campaignStore.addNpc(npc);
        app.modal.close();
        window.location.hash = routes.npcDetail(campaignId, npc.id);
      },
      onCancel: () => app.modal.close(),
      tagSuggestions: app.searchService.suggestTags(),
    });
    form.append(
      createElement("button", { className: "button", text: "Save", attrs: { type: "submit" } })
    );
    app.modal.open({ title: "Create NPC", content: form, actions: [] });
  };

  newNpcButton.addEventListener("click", () => {
    openCreateNpcModal();
  });

  header.append(
    createElement("h1", { text: "NPCs" }),
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
    newNpcButton
  );

  listCard.append(listView.element);

  updateArchivedState();
  container.append(header, listCard);
  refresh();

  return container;
};
