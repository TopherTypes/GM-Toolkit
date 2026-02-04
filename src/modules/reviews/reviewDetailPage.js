import { createElement } from "../../ui/dom.js";
import { createDetailLayout } from "../../ui/components/DetailLayout.js";
import { createReferencesPanel } from "../../ui/components/ReferencesPanel.js";
import { nowIso } from "../../utils/dates.js";
import { routes } from "../../router/routes.js";
import { createReviewForm } from "./reviewForm.js";

// Session review detail page for editing outcomes and references.
export const renderReviewDetailPage = ({ app, campaignId, reviewId, campaign }) => {
  const review = campaign.sessionReviews?.[reviewId];
  if (!review) {
    return createElement("div", { className: "card", text: "Review not found." });
  }

  const sessions = Object.values(campaign.sessions || {});
  const npcs = Object.values(campaign.npcs || {});
  const locations = Object.values(campaign.locations || {});

  const form = createReviewForm({
    review,
    sessions,
    npcs,
    locations,
    onSubmit: async (data) => {
      if (!data.sessionId) {
        app.banners.show("Session selection is required.", "error");
        return;
      }
      await app.campaignStore.updateSessionReview(reviewId, {
        ...data,
        updatedAt: nowIso(),
      });
      app.toasts.show("Review updated.");
    },
  });

  const saveButton = createElement("button", {
    className: "button",
    text: "Save changes",
    attrs: { type: "submit" },
  });
  form.append(saveButton);

  const archiveAction = () => {
    const content = createElement("p", { text: "Archive this review? You can restore it later." });
    app.modal.open({
      title: "Archive review",
      content,
      actions: [
        {
          label: "Archive",
          variant: "danger",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateSessionReview(reviewId, { isArchived: true, archivedAt: nowIso() });
            app.toasts.show("Review archived.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const restoreAction = () => {
    const content = createElement("p", { text: "Restore this review to active status?" });
    app.modal.open({
      title: "Restore review",
      content,
      actions: [
        {
          label: "Restore",
          variant: "primary",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateSessionReview(reviewId, { isArchived: false, archivedAt: null });
            app.toasts.show("Review restored.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const linkedSession = campaign.sessions?.[review.sessionId];
  const sessionSectionItems = linkedSession
    ? [
        {
          label: linkedSession.title || "Untitled session",
          meta: linkedSession.date || "",
          onClick: () => {
            window.location.hash = routes.sessionDetail(campaignId, linkedSession.id);
          },
        },
      ]
    : [{ label: "Missing session", meta: "", onClick: null }];

  const encounterItems = (linkedSession?.encounterIds || [])
    .map((encounterId) => campaign.encounters?.[encounterId])
    .filter(Boolean)
    .map((encounter) => ({
      label: encounter.title || "Untitled encounter",
      meta: encounter.mapRef || "",
      onClick: () => {
        window.location.hash = routes.encounterDetail(campaignId, encounter.id);
      },
    }));

  const notableNpcIds = new Set(linkedSession?.notableNpcIds || []);
  const notableLocationIds = new Set(linkedSession?.notableLocationIds || []);
  (review.informationChanges?.changes || []).forEach((change) => {
    if (change.entityType === "npc" && change.entityId) {
      notableNpcIds.add(change.entityId);
    }
    if (change.entityType === "location" && change.entityId) {
      notableLocationIds.add(change.entityId);
    }
  });

  const npcItems = [...notableNpcIds]
    .map((npcId) => campaign.npcs?.[npcId])
    .filter(Boolean)
    .map((npc) => ({
      label: npc.name || "Unknown NPC",
      meta: npc.role || "",
      onClick: () => {
        window.location.hash = routes.npcDetail(campaignId, npc.id);
      },
    }));

  const locationItems = [...notableLocationIds]
    .map((locationId) => campaign.locations?.[locationId])
    .filter(Boolean)
    .map((location) => ({
      label: location.name || "Unknown location",
      meta: location.description || "",
      onClick: () => {
        window.location.hash = routes.locationDetail(campaignId, location.id);
      },
    }));

  const referencesPanel = createReferencesPanel({
    sections: [
      { title: "Session", items: sessionSectionItems },
      { title: "Encounters", items: encounterItems },
      { title: "NPCs", items: npcItems },
      { title: "Locations", items: locationItems },
    ].filter((section) => section.items.length),
  });

  return createDetailLayout({
    title: linkedSession?.title || "Session review",
    actions: [
      review.isArchived
        ? { label: "Restore", variant: "primary", onClick: restoreAction }
        : { label: "Archive", variant: "danger", onClick: archiveAction },
    ],
    mainContent: form,
    sidebarContent: referencesPanel,
  });
};
