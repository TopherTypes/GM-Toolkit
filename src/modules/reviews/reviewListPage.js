import { createElement } from "../../ui/dom.js";
import { createListView } from "../../ui/components/ListView.js";
import { createId } from "../../utils/ids.js";
import { nowIso } from "../../utils/dates.js";
import { routes } from "../../router/routes.js";
import { createReviewForm } from "./reviewForm.js";

// Session review list page with search, archive toggle, and create flow.
export const renderReviewListPage = ({ app, campaignId, campaign }) => {
  const container = createElement("div", { className: "form-grid" });
  const header = createElement("div", { className: "card" });
  const listCard = createElement("div", { className: "card" });
  const listView = createListView();

  const searchInput = createElement("input", {
    className: "input",
    attrs: { type: "search", placeholder: "Search reviews and press Enter", "aria-label": "Review search" },
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

  const getSessionLabel = (session) => session?.title || "Untitled session";

  const refresh = () => {
    const reviews = Object.values(campaign.sessionReviews || {});
    const filtered = reviews.filter((review) => {
      if (!showArchivedToggle.checked && review.isArchived) {
        return false;
      }
      if (!searchQuery) {
        return true;
      }
      const session = campaign.sessions?.[review.sessionId];
      const haystack = [
        getSessionLabel(session),
        review.summary,
        review.keyMoments,
        review.outcomes,
        review.rewards,
        review.nextHooks,
        review.gmNotes,
        review.informationChanges?.freeText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchQuery.toLowerCase());
    });

    const sorted = [...filtered].sort((a, b) => {
      const sessionA = campaign.sessions?.[a.sessionId];
      const sessionB = campaign.sessions?.[b.sessionId];
      const dateA = new Date(sessionA?.date || a.updatedAt || 0).getTime();
      const dateB = new Date(sessionB?.date || b.updatedAt || 0).getTime();
      return dateB - dateA;
    });

    listView.setItems(
      sorted.map((review) => {
        const session = campaign.sessions?.[review.sessionId];
        return {
          title: getSessionLabel(session),
          meta: [session?.date || "", review.updatedAt ? `Updated ${review.updatedAt.split("T")[0]}` : ""]
            .filter(Boolean)
            .join(" • "),
          isArchived: review.isArchived,
          badges: review.isArchived ? [{ text: "ARCHIVED", variant: "muted" }] : [],
          onClick: () => {
            window.location.hash = routes.reviewDetail(campaignId, review.id);
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

  showArchivedToggle.addEventListener("change", () => {
    updateArchivedState();
    refresh();
  });

  const newReviewButton = createElement("button", {
    className: "button",
    text: "Create review",
    attrs: { type: "button" },
  });

  newReviewButton.addEventListener("click", () => {
    const form = createReviewForm({
      sessions: Object.values(campaign.sessions || {}),
      npcs: Object.values(campaign.npcs || {}),
      locations: Object.values(campaign.locations || {}),
      onSubmit: async (data) => {
        if (!data.sessionId) {
          app.banners.show("Session selection is required.", "error");
          return;
        }
        const timestamp = nowIso();
        const review = {
          id: createId("rev"),
          campaignId,
          ...data,
          createdAt: timestamp,
          updatedAt: timestamp,
          isArchived: false,
          archivedAt: null,
        };
        await app.campaignStore.addSessionReview(review);
        app.modal.close();
        window.location.hash = routes.reviewDetail(campaignId, review.id);
      },
      onCancel: () => app.modal.close(),
    });

    form.append(
      createElement("button", { className: "button", text: "Save", attrs: { type: "submit" } })
    );
    app.modal.open({ title: "Create review", content: form, actions: [] });
  });

  header.append(
    createElement("h1", { text: "Reviews" }),
    createElement("div", { className: "form-row inline", children: [searchInput] }),
    createElement("div", {
      className: "form-row inline",
      children: [
        createElement("label", { text: "Show archived", children: [showArchivedToggle] }),
        archivedStateBadge,
      ],
    }),
    newReviewButton
  );

  listCard.append(listView.element);

  updateArchivedState();
  container.append(header, listCard);
  refresh();

  return container;
};
