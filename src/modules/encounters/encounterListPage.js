import { createElement } from "../../ui/dom.js";
import { createListView } from "../../ui/components/ListView.js";
import { createId } from "../../utils/ids.js";
import { nowIso } from "../../utils/dates.js";
import { routes } from "../../router/routes.js";
import { calculateEncounterXp } from "./encounterUtils.js";

// Encounter list page with search, filter, and create flow.
export const renderEncounterListPage = ({ app, campaignId, campaign }) => {
  const container = createElement("div", { className: "form-grid" });
  const header = createElement("div", { className: "card" });
  const listCard = createElement("div", { className: "card" });
  const listView = createListView();

  const searchInput = createElement("input", {
    className: "input",
    attrs: { type: "search", placeholder: "Search encounters and press Enter", "aria-label": "Encounter search" },
  });
  const tagFilter = createElement("input", {
    className: "input",
    attrs: { type: "text", placeholder: "Filter by tag", "aria-label": "Filter by tag" },
  });
  const sortSelect = createElement("select", {
    className: "select",
    attrs: { "aria-label": "Sort encounters" },
  });
  [
    { value: "title", label: "Sort by title" },
    { value: "updated", label: "Sort by last updated" },
  ].forEach((option) => {
    sortSelect.append(createElement("option", { text: option.label, attrs: { value: option.value } }));
  });

  const showArchivedToggle = createElement("input", {
    attrs: { type: "checkbox", "aria-label": "Show archived" },
  });
  const archivedStateBadge = createElement("span", { className: "badge", text: "Showing archived: OFF" });

  let searchQuery = "";
  showArchivedToggle.checked = Boolean(app.settings?.get?.().showArchivedByDefault);

  const updateArchivedState = () => {
    const isOn = showArchivedToggle.checked;
    archivedStateBadge.textContent = `Showing archived: ${isOn ? "ON" : "OFF"}`;
    archivedStateBadge.className = isOn ? "badge warning" : "badge";
  };

  const refresh = () => {
    const encounters = Object.values(campaign.encounters || {});
    const filtered = encounters.filter((encounter) => {
      if (!showArchivedToggle.checked && encounter.isArchived) {
        return false;
      }
      if (searchQuery) {
        const haystack = `${encounter.title} ${encounter.mapRef || ""} ${(encounter.tags || []).join(" ")}`.toLowerCase();
        if (!haystack.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      if (tagFilter.value.trim()) {
        const tag = tagFilter.value.trim().toLowerCase();
        if (!encounter.tags?.map((item) => item.toLowerCase()).includes(tag)) {
          return false;
        }
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortSelect.value === "updated") {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }
      return a.title.localeCompare(b.title);
    });

    listView.setItems(
      sorted.map((encounter) => {
        const xpSummary = calculateEncounterXp({ encounter, campaign });
        const meta = [encounter.mapRef || "", `XP ${xpSummary.totalXp.toLocaleString()}`]
          .filter(Boolean)
          .join(" • ");
        return {
          title: encounter.title,
          meta,
          isArchived: encounter.isArchived,
          badges: encounter.isArchived ? [{ text: "ARCHIVED", variant: "muted" }] : [],
          onClick: () => {
            window.location.hash = routes.encounterDetail(campaignId, encounter.id);
          },
        };
      })
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
  showArchivedToggle.addEventListener("change", () => {
    updateArchivedState();
    refresh();
  });

  const newEncounterButton = createElement("button", {
    className: "button",
    text: "Create encounter",
    attrs: { type: "button" },
  });

  newEncounterButton.addEventListener("click", () => {
    const titleInput = createElement("input", {
      className: "input",
      attrs: { type: "text", required: true, "aria-label": "Encounter title" },
    });
    const mapInput = createElement("input", {
      className: "input",
      attrs: { type: "text", required: true, "aria-label": "Map reference" },
    });
    const tacticsInput = createElement("textarea", {
      className: "textarea",
      attrs: { rows: 4, required: true, "aria-label": "Tactics" },
    });
    const treasureInput = createElement("textarea", {
      className: "textarea",
      attrs: { rows: 4, required: true, "aria-label": "Treasure notes" },
    });

    const form = createElement("form", {
      className: "form-grid",
      children: [
        createElement("label", { text: "Title", children: [titleInput] }),
        createElement("label", { text: "Map reference", children: [mapInput] }),
        createElement("label", { text: "Tactics", children: [tacticsInput] }),
        createElement("label", { text: "Treasure notes", children: [treasureInput] }),
        createElement("button", { className: "button", text: "Create", attrs: { type: "submit" } }),
      ],
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!titleInput.value.trim() || !mapInput.value.trim()) {
        app.banners.show("Title and map reference are required.", "error");
        return;
      }
      const timestamp = nowIso();
      const encounter = {
        id: createId("enc"),
        campaignId,
        title: titleInput.value.trim(),
        mapRef: mapInput.value.trim(),
        tactics: tacticsInput.value.trim(),
        treasureNotes: treasureInput.value.trim(),
        participants: [],
        notes: "",
        tags: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        isArchived: false,
        archivedAt: null,
      };
      await app.campaignStore.addEncounter(encounter);
      app.modal.close();
      window.location.hash = routes.encounterDetail(campaignId, encounter.id);
    });

    app.modal.open({ title: "Create encounter", content: form, actions: [] });
  });

  header.append(
    createElement("h1", { text: "Encounters" }),
    createElement("div", {
      className: "form-row inline",
      children: [searchInput, tagFilter, sortSelect],
    }),
    createElement("div", {
      className: "form-row inline",
      children: [
        createElement("label", { text: "Show archived", children: [showArchivedToggle] }),
        archivedStateBadge,
      ],
    }),
    newEncounterButton
  );

  listCard.append(listView.element);

  updateArchivedState();
  container.append(header, listCard);
  refresh();

  return container;
};
