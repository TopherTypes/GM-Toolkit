import { createElement } from "../../ui/dom.js";
import { createDetailLayout } from "../../ui/components/DetailLayout.js";
import { createReferencesPanel } from "../../ui/components/ReferencesPanel.js";
import { nowIso } from "../../utils/dates.js";
import { routes } from "../../router/routes.js";
import { createLocationForm } from "./locationForm.js";

// Location detail page for editing, archiving, and backlink review.
export const renderLocationDetailPage = ({ app, campaignId, locationId, campaign }) => {
  const location = campaign.locations?.[locationId];
  if (!location) {
    return createElement("div", { className: "card", text: "Location not found." });
  }

  const form = createLocationForm({
    location,
    locations: Object.values(campaign.locations || {}),
    onSubmit: async (data) => {
      await app.campaignStore.updateLocation(locationId, { ...data, updatedAt: nowIso() });
      app.toasts.show("Location updated.");
    },
    tagSuggestions: app.searchService.suggestTags({ scopes: ["locations"] }),
  });

  const saveButton = createElement("button", {
    className: "button",
    text: "Save changes",
    attrs: { type: "submit" },
  });
  form.append(saveButton);

  const archiveAction = () => {
    const content = createElement("p", { text: "Archive this location? You can restore it later." });
    app.modal.open({
      title: "Archive location",
      content,
      actions: [
        {
          label: "Archive",
          variant: "danger",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateLocation(locationId, { isArchived: true, archivedAt: nowIso() });
            app.toasts.show("Location archived.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const restoreAction = () => {
    const content = createElement("p", { text: "Restore this location to active status?" });
    app.modal.open({
      title: "Restore location",
      content,
      actions: [
        {
          label: "Restore",
          variant: "primary",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateLocation(locationId, { isArchived: false, archivedAt: null });
            app.toasts.show("Location restored.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  // Build backlink sections for the references panel (children, NPCs, sessions).
  const childLocations = Object.values(campaign.locations || {}).filter(
    (child) => child.parentLocationId === location.id
  );
  const npcsInLocation = Object.values(campaign.npcs || {}).filter((npc) => npc.locationId === location.id);
  const sessionsWithLocation = Object.values(campaign.sessions || {}).filter((session) =>
    (session.notableLocationIds || []).includes(location.id)
  );

  const referencesPanel = createReferencesPanel({
    sections: [
      {
        title: "Child locations",
        items: childLocations.map((child) => ({
          label: child.name,
          meta: child.isArchived ? "Archived" : "",
          onClick: () => {
            window.location.hash = routes.locationDetail(campaignId, child.id);
          },
        })),
      },
      {
        title: "NPCs",
        items: npcsInLocation.map((npc) => ({
          label: npc.name,
          meta: npc.isArchived ? "Archived" : "",
          onClick: () => {
            window.location.hash = routes.npcDetail(campaignId, npc.id);
          },
        })),
      },
      {
        title: "Sessions",
        items: sessionsWithLocation.map((session) => ({
          label: session.title || "Untitled session",
          meta: session.date || "",
          onClick: () => {
            window.location.hash = routes.sessionDetail(campaignId, session.id);
          },
        })),
      },
    ],
  });

  return createDetailLayout({
    title: location.name,
    actions: [
      location.isArchived
        ? { label: "Restore", variant: "primary", onClick: restoreAction }
        : { label: "Archive", variant: "danger", onClick: archiveAction },
    ],
    mainContent: form,
    sidebarContent: referencesPanel,
  });
};
