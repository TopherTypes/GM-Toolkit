import { createElement } from "../../ui/dom.js";
import { createListView } from "../../ui/components/ListView.js";
import { createPartyForm } from "./partyForm.js";
import { createId } from "../../utils/ids.js";
import { nowIso } from "../../utils/dates.js";
import { routes } from "../../router/routes.js";

// Party list page with search, sorting, and create flow.
export const renderPartyListPage = ({ app, campaignId, campaign }) => {
  const container = createElement("div", { className: "form-grid" });
  const header = createElement("div", { className: "card" });
  const listCard = createElement("div", { className: "card" });
  const listView = createListView();

  const searchInput = createElement("input", {
    className: "input",
    attrs: { type: "search", placeholder: "Search party members and press Enter", "aria-label": "Party search" },
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
  const sortSelect = createElement("select", {
    className: "select",
    attrs: { "aria-label": "Sort party members" },
  });
  [
    { value: "character", label: "Sort by character name" },
    { value: "player", label: "Sort by player name" },
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

  // Keep the archived status label in sync with the toggle state.
  const updateArchivedState = () => {
    const isOn = showArchivedToggle.checked;
    archivedStateBadge.textContent = `Showing archived: ${isOn ? "ON" : "OFF"}`;
    archivedStateBadge.className = isOn ? "badge warning" : "badge";
  };

  // Keep users informed about active search/filter context.
  const updateSearchSummary = (visibleCount, totalCount) => {
    const parts = [];
    if (searchQuery) {
      parts.push(`search: “${searchQuery}”`);
    }
    if (showArchivedToggle.checked) {
      parts.push("including archived");
    }
    const filterText = parts.length ? parts.join(" • ") : "no filters";
    searchSummary.textContent = `Showing ${visibleCount} of ${totalCount} party members (${filterText}).`;
    clearButton.disabled = !searchQuery;
  };

  const refresh = () => {
    const members = Object.values(campaign.party || {});
    const filtered = members.filter((member) => {
      if (!showArchivedToggle.checked && member.isArchived) {
        return false;
      }
      if (searchQuery) {
        const haystack = `${member.playerName || ""} ${member.characterName || ""} ${member.class || ""} ${member.notes || ""}`.toLowerCase();
        if (!haystack.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortSelect.value === "updated") {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }
      if (sortSelect.value === "player") {
        return (a.playerName || "").localeCompare(b.playerName || "");
      }
      return (a.characterName || "").localeCompare(b.characterName || "");
    });

    listView.setItems(
      sorted.map((member) => {
        const acParts = [
          member.ac?.normal !== undefined ? `AC ${member.ac.normal}` : null,
          member.ac?.touch !== undefined ? `Touch ${member.ac.touch}` : null,
          member.ac?.flatFooted !== undefined ? `FF ${member.ac.flatFooted}` : null,
        ].filter(Boolean);
        const metaParts = [
          member.playerName ? `Player: ${member.playerName}` : null,
          member.class ? `${member.class}${member.level ? ` ${member.level}` : ""}` : member.level ? `Level ${member.level}` : null,
          acParts.length ? acParts.join(" / ") : null,
          member.hp !== undefined ? `HP ${member.hp}` : null,
        ].filter(Boolean);
        return {
          title: member.characterName || "Unnamed character",
          meta: metaParts.join(" • "),
          isArchived: member.isArchived,
          badges: member.isArchived ? [{ text: "ARCHIVED", variant: "muted" }] : [],
          onClick: () => {
            window.location.hash = routes.partyDetail(campaignId, member.id);
          },
        };
      }),
      {
        emptyState: {
          title: "No party members yet",
          description: "Add the party to keep XP splits and session prep in sync.",
          actionLabel: "Add party member",
          onAction: () => openCreatePartyModal(),
        },
      }
    );
    updateSearchSummary(filtered.length, members.length);
  };

  // Apply search only when Enter is pressed to match module convention.
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
  sortSelect.addEventListener("change", refresh);
  showArchivedToggle.addEventListener("change", () => {
    updateArchivedState();
    refresh();
  });

  const newPartyMemberButton = createElement("button", {
    className: "button",
    text: "Add party member",
    attrs: { type: "button" },
  });

  const openCreatePartyModal = () => {
    const form = createPartyForm({
      onSubmit: async (data) => {
        if (!data.playerName) {
          app.banners.show("Player name is required.", "error");
          return;
        }
        if (!data.characterName) {
          app.banners.show("Character name is required.", "error");
          return;
        }
        const timestamp = nowIso();
        const member = {
          id: createId("pty"),
          campaignId,
          ...data,
          createdAt: timestamp,
          updatedAt: timestamp,
          isArchived: false,
          archivedAt: null,
        };
        await app.campaignStore.addPartyMember(member);
        app.modal.close();
        window.location.hash = routes.partyDetail(campaignId, member.id);
      },
      onCancel: () => app.modal.close(),
    });
    form.append(
      createElement("button", { className: "button", text: "Save", attrs: { type: "submit" } })
    );
    app.modal.open({ title: "Add party member", content: form, actions: [] });
  };

  newPartyMemberButton.addEventListener("click", () => {
    openCreatePartyModal();
  });

  header.append(
    createElement("h1", { text: "Party" }),
    createElement("div", {
      className: "form-row inline",
      children: [searchInput, searchButton, clearButton, sortSelect],
    }),
    createElement("div", {
      className: "form-row inline",
      children: [
        createElement("label", { text: "Show archived", children: [showArchivedToggle] }),
        archivedStateBadge,
      ],
    }),
    searchSummary,
    newPartyMemberButton
  );

  listCard.append(listView.element);

  updateArchivedState();
  container.append(header, listCard);
  refresh();

  return container;
};
