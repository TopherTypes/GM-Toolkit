import { createElement } from "../../ui/dom.js";
import { createListView } from "../../ui/components/ListView.js";
import { createId } from "../../utils/ids.js";
import { nowIso } from "../../utils/dates.js";
import { routes } from "../../router/routes.js";

// Session list page with create flow and ordered encounter references.
export const renderSessionListPage = ({ app, campaignId, campaign }) => {
  const container = createElement("div", { className: "form-grid" });
  const header = createElement("div", { className: "card" });
  const listCard = createElement("div", { className: "card" });
  const listView = createListView();

  const searchInput = createElement("input", {
    className: "input",
    attrs: { type: "search", placeholder: "Search sessions and press Enter", "aria-label": "Session search" },
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
  const searchSummary = createElement("p", { className: "text-muted search-summary", text: "" });

  let searchQuery = "";

  const refresh = () => {
    const sessions = Object.values(campaign.sessions || {});
    const filtered = sessions.filter((session) => {
      if (!searchQuery) return true;
      const haystack = `${session.title} ${session.overview || ""}`.toLowerCase();
      return haystack.includes(searchQuery.toLowerCase());
    });

    const sorted = [...filtered].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    listView.setItems(
      sorted.map((session) => ({
        title: session.title || "Untitled session",
        meta: [session.date || "", `${(session.encounterIds || []).length} encounters`]
          .filter(Boolean)
          .join(" • "),
        onClick: () => {
          window.location.hash = routes.sessionDetail(campaignId, session.id);
        },
      })),
      {
        emptyState: {
          title: "No sessions yet",
          description: "Create a session to start linking encounters and notes.",
          actionLabel: "Create session",
          onAction: () => openCreateSessionModal(),
        },
      }
    );
    searchSummary.textContent = `Showing ${filtered.length} of ${sessions.length} sessions${searchQuery ? ` for “${searchQuery}”` : ""}.`;
    clearButton.disabled = !searchQuery;
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
    searchQuery = "";
    refresh();
  });

  const newSessionButton = createElement("button", {
    className: "button",
    text: "Create session",
    attrs: { type: "button" },
  });

  const openCreateSessionModal = () => {
    const titleInput = createElement("input", {
      className: "input",
      attrs: { type: "text", required: true, "aria-label": "Session title" },
    });
    const dateInput = createElement("input", {
      className: "input",
      attrs: { type: "date", "aria-label": "Session date" },
    });

    const form = createElement("form", {
      className: "form-grid",
      children: [
        createElement("label", { text: "Title", children: [titleInput] }),
        createElement("label", { text: "Date", children: [dateInput] }),
        createElement("button", { className: "button", text: "Create", attrs: { type: "submit" } }),
      ],
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!titleInput.value.trim()) {
        app.banners.show("Session title is required.", "error");
        return;
      }
      const timestamp = nowIso();
      const session = {
        id: createId("ses"),
        campaignId,
        title: titleInput.value.trim(),
        date: dateInput.value || "",
        overview: "",
        agenda: "",
        encounterIds: [],
        gmNotes: "",
        tags: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await app.campaignStore.addSession(session);
      app.modal.close();
      window.location.hash = routes.sessionDetail(campaignId, session.id);
    });

    app.modal.open({ title: "Create session", content: form, actions: [] });
  };

  newSessionButton.addEventListener("click", () => {
    openCreateSessionModal();
  });

  header.append(
    createElement("h1", { text: "Sessions" }),
    createElement("div", { className: "form-row inline", children: [searchInput, searchButton, clearButton] }),
    searchSummary,
    newSessionButton
  );

  listCard.append(listView.element);

  container.append(header, listCard);
  refresh();

  return container;
};
