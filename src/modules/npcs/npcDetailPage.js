import { createElement } from "../../ui/dom.js";
import { createDetailLayout } from "../../ui/components/DetailLayout.js";
import { createNpcForm } from "./npcForm.js";
import { createReferencesPanel } from "../../ui/components/ReferencesPanel.js";
import { nowIso } from "../../utils/dates.js";

// NPC detail page for editing and archiving.
export const renderNpcDetailPage = ({ app, campaignId, npcId, campaign }) => {
  const npc = campaign.npcs?.[npcId];
  if (!npc) {
    return createElement("div", { className: "card", text: "NPC not found." });
  }

  const form = createNpcForm({
    npc,
    onSubmit: async (data) => {
      await app.campaignStore.updateNpc(npcId, { ...data, updatedAt: nowIso() });
      app.toasts.show("NPC updated.");
    },
    tagSuggestions: app.searchService.suggestTags(),
  });

  const saveButton = createElement("button", {
    className: "button",
    text: "Save changes",
    attrs: { type: "submit" },
  });
  form.append(saveButton);

  const archiveAction = () => {
    const content = createElement("p", { text: "Archive this NPC? You can restore it later." });
    app.modal.open({
      title: "Archive NPC",
      content,
      actions: [
        {
          label: "Archive",
          variant: "danger",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateNpc(npcId, { isArchived: true, archivedAt: nowIso() });
            app.toasts.show("NPC archived.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const restoreAction = () => {
    const content = createElement("p", { text: "Restore this NPC to active status?" });
    app.modal.open({
      title: "Restore NPC",
      content,
      actions: [
        {
          label: "Restore",
          variant: "primary",
          onClick: async () => {
            app.modal.close();
            await app.campaignStore.updateNpc(npcId, { isArchived: false, archivedAt: null });
            app.toasts.show("NPC restored.");
          },
        },
        { label: "Cancel", variant: "secondary", onClick: () => app.modal.close() },
      ],
    });
  };

  const layout = createDetailLayout({
    title: npc.name,
    actions: [
      npc.isArchived
        ? { label: "Restore", variant: "primary", onClick: restoreAction }
        : { label: "Archive", variant: "danger", onClick: archiveAction },
    ],
    mainContent: form,
    sidebarContent: createReferencesPanel(),
  });

  return layout;
};
