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

  let searchQuery = "";

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
        onClick: () => {
          window.location.hash = routes.npcDetail(campaignId, npc.id);
        },
      }))
    );
  };

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchQuery = searchInput.value.trim();
      refresh();
    }
  });
  tagFilter.addEventListener("input", refresh);
  sortSelect.addEventListener("change", refresh);
  showArchivedToggle.addEventListener("change", refresh);

  const newNpcButton = createElement("button", {
    className: "button",
    text: "Create NPC",
    attrs: { type: "button" },
  });

  newNpcButton.addEventListener("click", () => {
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
  });

  header.append(
    createElement("h1", { text: "NPCs" }),
    createElement("div", {
      className: "form-row inline",
      children: [searchInput, tagFilter, sortSelect],
    }),
    createElement("label", { text: "Show archived", children: [showArchivedToggle] }),
    newNpcButton
  );

  listCard.append(listView.element);

  container.append(header, listCard);
  refresh();

  return container;
};
