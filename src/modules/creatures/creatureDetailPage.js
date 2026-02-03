import { createElement } from "../../ui/dom.js";
import { createDetailLayout } from "../../ui/components/DetailLayout.js";
import { createCreatureForm } from "./creatureForm.js";
import { createReferencesPanel } from "../../ui/components/ReferencesPanel.js";
import { routes } from "../../router/routes.js";
import { nowIso } from "../../utils/dates.js";

// Creature detail page for editing and archiving.
export const renderCreatureDetailPage = ({ app, campaignId, creatureId, campaign }) => {
  const creature = campaign.creatures?.[creatureId];
  if (!creature) {
    return createElement("div", { className: "card", text: "Creature not found." });
  }

  const variantOptions = Object.values(campaign.creatures || {}).filter(
    (entry) => entry.id !== creatureId && !entry.isArchived
  );

  const form = createCreatureForm({
    creature,
    onSubmit: async ({ data, xpUnknown }) => {
      if (xpUnknown) {
        app.banners.show("CR not recognized. XP saved as 0.", "warning");
      }
      await app.campaignStore.updateCreature(creatureId, data);
      app.toasts.show("Creature updated.");
    },
    tagSuggestions: app.searchService.suggestTags({ scopes: ["creatures"] }),
    variantOptions,
  });

  const saveButton = createElement("button", {
    className: "button",
    text: "Save changes",
    attrs: { type: "submit" },
  });
  form.append(saveButton);

  const archiveAction = () => {
    const content = createElement("p", { text: "Archive this creature? You can restore it later." });
    app.modal.open({
      title: "Archive creature",
      content,
      actions: [
        {
          label: "Archive",
          variant: "danger",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateCreature(creatureId, { isArchived: true, archivedAt: nowIso() });
            app.toasts.show("Creature archived.");
            window.location.hash = routes.moduleList(campaignId, "creatures");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const restoreAction = () => {
    const content = createElement("p", { text: "Restore this creature to active status?" });
    app.modal.open({
      title: "Restore creature",
      content,
      actions: [
        {
          label: "Restore",
          variant: "primary",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateCreature(creatureId, { isArchived: false, archivedAt: null });
            app.toasts.show("Creature restored.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const layout = createDetailLayout({
    title: creature.name,
    actions: [
      creature.isArchived
        ? { label: "Restore", variant: "primary", onClick: restoreAction }
        : { label: "Archive", variant: "danger", onClick: archiveAction },
    ],
    mainContent: form,
    sidebarContent: createReferencesPanel(),
  });

  return layout;
};
